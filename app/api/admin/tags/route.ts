import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tag from "@/app/lib/models/Tag";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { clampPage, slugify } from "@/app/lib/admin/utils";
import { getMergedSiteTools } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";

function memoryTagsStore(): any[] {
  const g = globalThis as any;
  if (!g.__votAdminTags) g.__votAdminTags = [] as any[];
  return g.__votAdminTags as any[];
}

async function catalogTagPage(opts: { search?: string; page: number; limit: number }) {
  const tools = await getMergedSiteTools({ publishedOnly: false });
  const countMap = new Map<string, number>();
  for (const tool of tools) {
    for (const tag of tool.tags || []) {
      const name = String(tag).trim();
      if (!name) continue;
      countMap.set(name, (countMap.get(name) || 0) + 1);
    }
  }

  const fromCatalog = [...countMap.entries()].map(([name, toolCount]) => ({
    _id: `site-tag-${slugify(name)}`,
    name,
    slug: slugify(name),
    toolCount,
    createdAt: new Date().toISOString(),
    source: "site",
  }));

  const fromMemory = memoryTagsStore().map((t) => ({
    ...t,
    toolCount: countMap.get(t.name) || 0,
    source: "memory",
  }));

  const bySlug = new Map<string, any>();
  for (const row of [...fromCatalog, ...fromMemory]) {
    bySlug.set(row.slug, row);
  }

  let list = [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (t) =>
        String(t.name || "").toLowerCase().includes(q) ||
        String(t.slug || "").toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / Math.max(1, opts.limit)));
  const safePage = clampPage(opts.page, pages);
  const items = list.slice((safePage - 1) * opts.limit, safePage * opts.limit);
  return { items, total, page: safePage, pages };
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    if (!isDBConnected()) {
      return Response.json(await catalogTagPage({ search, page, limit }));
    }

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    try {
      const [total, tags] = await Promise.all([
        Tag.countDocuments(filter),
        Tag.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ]);

      let countMap: Record<string, number> = {};
      try {
        const usage = await Tool.aggregate([
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
        ]);
        for (const u of usage) countMap[u._id] = u.count;
      } catch {
        const tools = await getMergedSiteTools({ publishedOnly: false });
        for (const tool of tools) {
          for (const tag of tool.tags || []) {
            countMap[tag] = (countMap[tag] || 0) + 1;
          }
        }
      }

      const items = tags.map((t) => ({ ...t, toolCount: countMap[t.name] || 0 }));
      const pages = Math.max(1, Math.ceil(total / limit));
      return Response.json({ items, total, page: clampPage(page, pages), pages });
    } catch (err: any) {
      console.warn("admin/tags Mongo failed, using catalog:", err?.message || err);
      return Response.json(await catalogTagPage({ search, page, limit }));
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

    const slug = body.slug ? String(body.slug).trim() : slugify(name);
    if (!slug) return Response.json({ error: "Valid name or slug is required" }, { status: 400 });

    if (!isDBConnected()) {
      const store = memoryTagsStore();
      if (store.some((t) => t.slug === slug)) {
        return Response.json({ error: `A tag with slug "${slug}" already exists` }, { status: 409 });
      }
      const tag = {
        _id: `mem-tag-${slug}`,
        name,
        slug,
        createdAt: new Date().toISOString(),
      };
      store.unshift(tag);
      await logActivity(user.email, "created", `tag:${slug}`, { name });
      return Response.json(tag, { status: 201 });
    }

    try {
      const existing = await Tag.findOne({ slug });
      if (existing) {
        return Response.json({ error: `A tag with slug "${slug}" already exists` }, { status: 409 });
      }
      const tag = await Tag.create({ name, slug });
      await logActivity(user.email, "created", `tag:${tag.slug}`, { name });
      return Response.json(tag, { status: 201 });
    } catch (err: any) {
      console.warn("admin/tags create Mongo failed:", err?.message || err);
      const store = memoryTagsStore();
      if (store.some((t) => t.slug === slug)) {
        return Response.json({ error: `A tag with slug "${slug}" already exists` }, { status: 409 });
      }
      const tag = {
        _id: `mem-tag-${slug}`,
        name,
        slug,
        createdAt: new Date().toISOString(),
      };
      store.unshift(tag);
      await logActivity(user.email, "created", `tag:${slug}`, { name });
      return Response.json(tag, { status: 201 });
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

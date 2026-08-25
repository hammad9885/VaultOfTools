import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Category from "@/app/lib/models/Category";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { clampPage, slugify } from "@/app/lib/admin/utils";
import { getMergedSiteTools } from "@/app/lib/data/public-tools";
import { categoryToolMap } from "@/app/lib/data/categories";

export const dynamic = "force-dynamic";

function memoryCategoriesStore(): any[] {
  const g = globalThis as any;
  if (!g.__votAdminCategories) g.__votAdminCategories = [] as any[];
  return g.__votAdminCategories as any[];
}

async function catalogCategoryPage(opts: { search?: string; page: number; limit: number }) {
  const tools = await getMergedSiteTools({ publishedOnly: false });
  const countMap = new Map<string, number>();
  for (const tool of tools) {
    const name = String(tool.category || "Uncategorized").trim();
    countMap.set(name, (countMap.get(name) || 0) + 1);
  }

  for (const name of Object.keys(categoryToolMap)) {
    if (!countMap.has(name)) countMap.set(name, categoryToolMap[name]?.length || 0);
  }

  const fromCatalog = [...countMap.entries()].map(([name, toolCount]) => ({
    _id: `site-cat-${slugify(name)}`,
    name,
    slug: slugify(name),
    icon: null,
    description: null,
    toolCount,
    createdAt: new Date().toISOString(),
    source: "site",
  }));

  const fromMemory = memoryCategoriesStore().map((c) => ({
    ...c,
    toolCount: countMap.get(c.name) || 0,
    source: "memory",
  }));

  const bySlug = new Map<string, any>();
  for (const row of [...fromCatalog, ...fromMemory]) {
    bySlug.set(row.slug, row);
  }

  let list = [...bySlug.values()].sort((a, b) => (b.toolCount || 0) - (a.toolCount || 0));
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (c) =>
        String(c.name || "").toLowerCase().includes(q) ||
        String(c.slug || "").toLowerCase().includes(q)
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
      return Response.json(await catalogCategoryPage({ search, page, limit }));
    }

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    try {
      const [total, categories] = await Promise.all([
        Category.countDocuments(filter),
        Category.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ]);

      let countMap: Record<string, number> = {};
      try {
        const counts = await Tool.aggregate([
          { $match: { category: { $in: categories.map((c) => c.name) } } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);
        for (const c of counts) countMap[c._id] = c.count;
      } catch {
        const tools = await getMergedSiteTools({ publishedOnly: false });
        for (const tool of tools) {
          countMap[tool.category] = (countMap[tool.category] || 0) + 1;
        }
      }

      const items = categories.map((c) => ({ ...c, toolCount: countMap[c.name] || 0 }));
      const pages = Math.max(1, Math.ceil(total / limit));
      return Response.json({ items, total, page: clampPage(page, pages), pages });
    } catch (err: any) {
      console.warn("admin/categories Mongo failed, using catalog:", err?.message || err);
      return Response.json(await catalogCategoryPage({ search, page, limit }));
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

    const payload = {
      name,
      slug,
      icon: body.icon || null,
      description: body.description || null,
    };

    if (!isDBConnected()) {
      const store = memoryCategoriesStore();
      if (store.some((c) => c.slug === slug)) {
        return Response.json({ error: `A category with slug "${slug}" already exists` }, { status: 409 });
      }
      const category = {
        _id: `mem-cat-${slug}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      store.unshift(category);
      await logActivity(user.email, "created", `category:${slug}`, { name });
      return Response.json(category, { status: 201 });
    }

    try {
      const existing = await Category.findOne({ slug });
      if (existing) {
        return Response.json({ error: `A category with slug "${slug}" already exists` }, { status: 409 });
      }
      const category = await Category.create(payload);
      await logActivity(user.email, "created", `category:${category.slug}`, { name });
      return Response.json(category, { status: 201 });
    } catch (err: any) {
      console.warn("admin/categories create Mongo failed:", err?.message || err);
      const store = memoryCategoriesStore();
      if (store.some((c) => c.slug === slug)) {
        return Response.json({ error: `A category with slug "${slug}" already exists` }, { status: 409 });
      }
      const category = {
        _id: `mem-cat-${slug}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      store.unshift(category);
      await logActivity(user.email, "created", `category:${slug}`, { name });
      return Response.json(category, { status: 201 });
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

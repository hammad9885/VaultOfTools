import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import memoryStore from "@/app/lib/data/memoryStore";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { asBool, asNumber, asStringArray, clampPage, slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

function buildToolPayload(body: any, name: string, slug: string) {
  const shortDescription = String(body.shortDescription || body.desc || "").trim();
  const description = String(body.description || body.fullDescription || shortDescription).trim();
  return {
    slug,
    name,
    category: String(body.category || "Uncategorized").trim(),
    categoryId: body.categoryId || null,
    logo: body.logo || body.logoUrl || undefined,
    logoUrl: body.logoUrl || body.logo || null,
    bannerUrl: body.bannerUrl || null,
    imageUrl: body.imageUrl || null,
    url: body.url || null,
    website: body.website || body.url || undefined,
    shortDescription,
    fullDescription: body.fullDescription || description,
    description,
    desc: shortDescription || description,
    pricing: body.pricing || "Free",
    rating: asNumber(body.rating, 0),
    reviews: asNumber(body.reviews, 0),
    features: asStringArray(body.features),
    pros: asStringArray(body.pros),
    cons: asStringArray(body.cons),
    tags: asStringArray(body.tags),
    featured: asBool(body.featured),
    sponsored: asBool(body.sponsored),
    status: ["draft", "published", "archived"].includes(body.status) ? body.status : "published",
    publishDate: body.publishDate || new Date(),
  };
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const featured = url.searchParams.get("featured")?.trim();
    const sponsored = url.searchParams.get("sponsored")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    if (!isDBConnected()) {
      const all = await memoryStore.getAdminTools({
        search,
        status: status && ["draft", "published", "archived"].includes(status) ? status : undefined,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
        sponsored: sponsored === "true" ? true : sponsored === "false" ? false : undefined,
      });
      const total = all.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      const items = all.slice((page - 1) * limit, page * limit);
      return Response.json({ items, total, page: clampPage(page, pages), pages });
    }

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["draft", "published", "archived"].includes(status)) filter.status = status;
    if (featured === "true") filter.featured = true;
    if (featured === "false") filter.featured = false;
    if (sponsored === "true") filter.sponsored = true;
    if (sponsored === "false") filter.sponsored = false;

    const [total, items] = await Promise.all([
      Tool.countDocuments(filter),
      Tool.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    return Response.json({ items, total, page: clampPage(page, pages), pages });
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

    const payload = buildToolPayload(body, name, slug);

    if (!isDBConnected()) {
      const existing = await memoryStore.getToolBySlug(slug);
      if (existing) {
        return Response.json({ error: `A tool with slug "${slug}" already exists` }, { status: 409 });
      }
      const tool = await memoryStore.createTool(payload);
      await logActivity(user.email, "created", `tool:${tool.slug}`, { name: tool.name });
      return Response.json(tool, { status: 201 });
    }

    const existing = await Tool.findOne({ slug });
    if (existing) {
      return Response.json({ error: `A tool with slug "${slug}" already exists` }, { status: 409 });
    }

    const tool = await Tool.create(payload);
    await logActivity(user.email, "created", `tool:${tool.slug}`, { name: tool.name });
    return Response.json(tool, { status: 201 });
  } catch (err: any) {
    return errorResponse(err);
  }
}

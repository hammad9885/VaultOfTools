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
  const website = String(body.website || body.url || "").trim();
  return {
    slug,
    name,
    category: String(body.category || "Uncategorized").trim(),
    categoryId: body.categoryId || null,
    subcategory: String(body.subcategory || "").trim(),
    toolType: String(body.toolType || "").trim(),
    logo: body.logo || body.logoUrl || undefined,
    logoUrl: body.logoUrl || body.logo || null,
    bannerUrl: body.bannerUrl || null,
    imageUrl: body.imageUrl || null,
    url: website || (body.url ? body.url : null),
    website: website || undefined,
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

    const { getMergedSiteTools } = await import("@/app/lib/data/public-tools");
    let all = await getMergedSiteTools({ publishedOnly: false });

    if (search) {
      const q = search.toLowerCase();
      all = all.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (status && ["draft", "published", "archived"].includes(status)) {
      all = all.filter((t) => (t.status || "published") === status);
    }
    if (featured === "true") all = all.filter((t) => t.featured);
    if (featured === "false") all = all.filter((t) => !t.featured);
    if (sponsored === "true") all = all.filter((t) => t.sponsored);
    if (sponsored === "false") all = all.filter((t) => !t.sponsored);

    all.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime() ||
        a.name.localeCompare(b.name)
    );

    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = clampPage(page, pages);
    const items = all.slice((safePage - 1) * limit, safePage * limit).map((t) => ({
      _id: t._id || `site-${t.slug}`,
      slug: t.slug,
      name: t.name,
      category: t.category,
      subcategory: t.subcategory || "",
      toolType: t.toolType || "",
      logo: t.logo,
      logoUrl: t.logoUrl || null,
      bannerUrl: t.bannerUrl || null,
      imageUrl: t.imageUrl || null,
      website: t.website,
      url: t.url,
      shortDescription: t.shortDescription || t.desc,
      description: t.description || t.desc,
      pricing: t.pricing,
      rating: t.rating,
      reviews: t.reviews,
      features: t.features,
      tags: t.tags,
      featured: Boolean(t.featured),
      sponsored: Boolean(t.sponsored),
      status: t.status || "published",
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.createdAt || new Date().toISOString(),
    }));
    return Response.json({ items, total, page: safePage, pages });
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

import { connectDB } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { asBool, asNumber, asStringArray, clampPage, slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

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

    const existing = await Tool.findOne({ slug });
    if (existing) return Response.json({ error: `A tool with slug "${slug}" already exists` }, { status: 409 });

    const tool = await Tool.create({
      slug,
      name,
      category: String(body.category || "Uncategorized").trim(),
      categoryId: body.categoryId || null,
      logo: body.logo || undefined,
      logoUrl: body.logoUrl || null,
      bannerUrl: body.bannerUrl || null,
      imageUrl: body.imageUrl || null,
      url: body.url || null,
      website: body.website || body.url || undefined,
      shortDescription: body.shortDescription || "",
      fullDescription: body.fullDescription || "",
      description: body.description || "",
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
    });

    await logActivity(user.email, "created", `tool:${tool.slug}`, { name: tool.name });
    return Response.json(tool, { status: 201 });
  } catch (err: any) {
    return errorResponse(err);
  }
}

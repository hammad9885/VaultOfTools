import { connectDB } from "@/app/lib/config/db";
import Category from "@/app/lib/models/Category";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { clampPage, slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const [total, categories] = await Promise.all([
      Category.countDocuments(filter),
      Category.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const counts = await Tool.aggregate([
      { $match: { category: { $in: categories.map((c) => c.name) } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    for (const c of counts) countMap[c._id] = c.count;

    const items = categories.map((c) => ({ ...c, toolCount: countMap[c.name] || 0 }));
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

    const existing = await Category.findOne({ slug });
    if (existing) return Response.json({ error: `A category with slug "${slug}" already exists` }, { status: 409 });

    const category = await Category.create({
      name,
      slug,
      icon: body.icon || null,
      description: body.description || null,
    });

    await logActivity(user.email, "created", `category:${category.slug}`, { name });
    return Response.json(category, { status: 201 });
  } catch (err: any) {
    return errorResponse(err);
  }
}

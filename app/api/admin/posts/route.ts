import { connectDB } from "@/app/lib/config/db";
import BlogPost from "@/app/lib/models/BlogPost";
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
    const category = url.searchParams.get("category")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;

    const [total, items] = await Promise.all([
      BlogPost.countDocuments(filter),
      BlogPost.find(filter)
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
    const title = String(body.title || "").trim();
    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    const slug = body.slug ? String(body.slug).trim() : slugify(title);
    if (!slug) return Response.json({ error: "Valid title or slug is required" }, { status: 400 });

    const existing = await BlogPost.findOne({ slug });
    if (existing) return Response.json({ error: `A post with slug "${slug}" already exists` }, { status: 409 });

    const post = await BlogPost.create({
      slug,
      title,
      excerpt: body.excerpt || "",
      category: String(body.category || "General").trim(),
      coverImage: body.coverImage || undefined,
      readTime: body.readTime || undefined,
      featured: !!body.featured,
      author: body.author || undefined,
      content: Array.isArray(body.content) ? body.content : [],
    });

    await logActivity(user.email, "created", `post:${post.slug}`, { title: post.title });
    return Response.json(post, { status: 201 });
  } catch (err: any) {
    return errorResponse(err);
  }
}

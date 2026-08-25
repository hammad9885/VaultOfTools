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

    const { getMergedSitePosts } = await import("@/app/lib/data/site-posts");
    let all = await getMergedSitePosts();
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q)
      );
    }
    if (category) all = all.filter((p) => p.category === category);

    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = clampPage(page, pages);
    const items = all.slice((safePage - 1) * limit, safePage * limit);
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

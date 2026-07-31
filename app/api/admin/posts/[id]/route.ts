import { connectDB } from "@/app/lib/config/db";
import BlogPost from "@/app/lib/models/BlogPost";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const post = await BlogPost.findById(id);
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const body = await request.json();
    const allowed = [
      "title", "excerpt", "category", "coverImage", "readTime", "featured", "author", "content",
    ];
    for (const key of allowed) {
      if (key in body) (post as any)[key] = body[key];
    }
    if ("title" in body && !body.title) return Response.json({ error: "Title is required" }, { status: 400 });

    if ("slug" in body) {
      const slug = String(body.slug || slugify(post.title)).trim();
      const dup = await BlogPost.findOne({ slug, _id: { $ne: post._id } });
      if (dup) return Response.json({ error: `A post with slug "${slug}" already exists` }, { status: 409 });
      post.slug = slug;
    }

    await post.save();
    await logActivity(user.email, "updated", `post:${post.slug}`, {});
    return Response.json(post);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `post:${post.slug}`, { title: post.title });
    return Response.json({ message: "Post deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

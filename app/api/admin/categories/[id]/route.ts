import { connectDB } from "@/app/lib/config/db";
import Category from "@/app/lib/models/Category";
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
    const category = await Category.findById(id);
    if (!category) return Response.json({ error: "Category not found" }, { status: 404 });

    const body = await request.json();
    if (body.name !== undefined) category.name = String(body.name).trim();
    if (body.slug !== undefined) category.slug = String(body.slug).trim();
    if (body.icon !== undefined) category.icon = body.icon || null;
    if (body.description !== undefined) category.description = body.description || null;

    if (!category.name) return Response.json({ error: "Name is required" }, { status: 400 });
    category.slug = category.slug || slugify(category.name);

    const dup = await Category.findOne({ slug: category.slug, _id: { $ne: category._id } });
    if (dup) return Response.json({ error: `A category with slug "${category.slug}" already exists` }, { status: 409 });

    await category.save();
    await logActivity(user.email, "updated", `category:${category.slug}`, {});
    return Response.json(category);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return Response.json({ error: "Category not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `category:${category.slug}`, { name: category.name });
    return Response.json({ message: "Category deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

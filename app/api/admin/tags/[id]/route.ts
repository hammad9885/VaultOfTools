import { connectDB } from "@/app/lib/config/db";
import Tag from "@/app/lib/models/Tag";
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
    const tag = await Tag.findById(id);
    if (!tag) return Response.json({ error: "Tag not found" }, { status: 404 });

    const body = await request.json();
    if (body.name !== undefined) tag.name = String(body.name).trim();
    if (body.slug !== undefined) tag.slug = String(body.slug).trim();
    if (!tag.name) return Response.json({ error: "Name is required" }, { status: 400 });
    tag.slug = tag.slug || slugify(tag.name);

    const dup = await Tag.findOne({ slug: tag.slug, _id: { $ne: tag._id } });
    if (dup) return Response.json({ error: `A tag with slug "${tag.slug}" already exists` }, { status: 409 });

    await tag.save();
    await logActivity(user.email, "updated", `tag:${tag.slug}`, {});
    return Response.json(tag);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const tag = await Tag.findByIdAndDelete(id);
    if (!tag) return Response.json({ error: "Tag not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `tag:${tag.slug}`, { name: tag.name });
    return Response.json({ message: "Tag deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

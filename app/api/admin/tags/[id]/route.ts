import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tag from "@/app/lib/models/Tag";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function memoryTagsStore(): any[] {
  const g = globalThis as any;
  if (!g.__votAdminTags) g.__votAdminTags = [] as any[];
  return g.__votAdminTags as any[];
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    if (!isDBConnected() || String(id).startsWith("mem-tag-") || String(id).startsWith("site-tag-")) {
      const store = memoryTagsStore();
      let tag = store.find((t) => String(t._id) === String(id));
      if (!tag && String(id).startsWith("site-tag-")) {
        const slug = String(id).replace(/^site-tag-/, "");
        tag = { _id: id, name: slug, slug };
        store.push(tag);
      }
      if (!tag) return Response.json({ error: "Tag not found" }, { status: 404 });
      if (body.name !== undefined) tag.name = String(body.name).trim();
      if (body.slug !== undefined) tag.slug = String(body.slug).trim();
      if (!tag.name) return Response.json({ error: "Name is required" }, { status: 400 });
      tag.slug = tag.slug || slugify(tag.name);
      await logActivity(user.email, "updated", `tag:${tag.slug}`, {});
      return Response.json(tag);
    }

    try {
      const tag = await Tag.findById(id);
      if (!tag) return Response.json({ error: "Tag not found" }, { status: 404 });

      if (body.name !== undefined) tag.name = String(body.name).trim();
      if (body.slug !== undefined) tag.slug = String(body.slug).trim();
      if (!tag.name) return Response.json({ error: "Name is required" }, { status: 400 });
      tag.slug = tag.slug || slugify(tag.name);

      const dup = await Tag.findOne({ slug: tag.slug, _id: { $ne: tag._id } });
      if (dup) {
        return Response.json({ error: `A tag with slug "${tag.slug}" already exists` }, { status: 409 });
      }

      await tag.save();
      await logActivity(user.email, "updated", `tag:${tag.slug}`, {});
      return Response.json(tag);
    } catch (err: any) {
      console.warn("admin/tags PATCH Mongo failed:", err?.message || err);
      return errorResponse(err);
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;

    if (!isDBConnected() || String(id).startsWith("mem-tag-") || String(id).startsWith("site-tag-")) {
      const store = memoryTagsStore();
      const idx = store.findIndex((t) => String(t._id) === String(id));
      if (idx === -1) {
        // Site-derived tags aren't persisted; treat delete as success no-op.
        if (String(id).startsWith("site-tag-")) {
          return Response.json({ message: "Tag deleted" });
        }
        return Response.json({ error: "Tag not found" }, { status: 404 });
      }
      const [tag] = store.splice(idx, 1);
      await logActivity(user.email, "deleted", `tag:${tag.slug}`, { name: tag.name });
      return Response.json({ message: "Tag deleted" });
    }

    try {
      const tag = await Tag.findByIdAndDelete(id);
      if (!tag) return Response.json({ error: "Tag not found" }, { status: 404 });
      await logActivity(user.email, "deleted", `tag:${tag.slug}`, { name: tag.name });
      return Response.json({ message: "Tag deleted" });
    } catch (err: any) {
      console.warn("admin/tags DELETE Mongo failed:", err?.message || err);
      return errorResponse(err);
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

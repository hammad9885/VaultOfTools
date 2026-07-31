import { connectDB } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { asBool, asNumber, asStringArray, slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const tool = await Tool.findById(id);
    if (!tool) return Response.json({ error: "Tool not found" }, { status: 404 });

    const body = await request.json();
    const allowed = [
      "name", "slug", "category", "categoryId", "logo", "logoUrl", "bannerUrl",
      "imageUrl", "url", "website", "shortDescription", "fullDescription",
      "description", "pricing", "rating", "reviews", "features", "pros", "cons",
      "tags", "featured", "featuredOrder", "sponsored", "sponsorName",
      "sponsorStartDate", "sponsorEndDate", "sponsorPriority", "sponsorActive",
      "seoTitle", "seoDescription", "status", "publishDate",
    ];

    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    if ("slug" in patch) {
      const slug = String(patch.slug || slugify(patch.slug || tool.name)).trim();
      const dup = await Tool.findOne({ slug, _id: { $ne: tool._id } });
      if (dup) return Response.json({ error: `A tool with slug "${slug}" already exists` }, { status: 409 });
      patch.slug = slug;
    }

    const bools = ["featured", "sponsored", "sponsorActive"];
    const numbers = ["rating", "reviews", "featuredOrder", "sponsorPriority"];
    const arrays = ["features", "pros", "cons", "tags"];
    for (const k of bools) if (k in patch) patch[k] = asBool(patch[k], tool[k] ?? false);
    for (const k of numbers) if (k in patch) patch[k] = asNumber(patch[k], tool[k] ?? 0);
    for (const k of arrays) if (k in patch) patch[k] = asStringArray(patch[k]);

    Object.assign(tool, patch);
    await tool.save();

    await logActivity(user.email, "updated", `tool:${tool.slug}`, { fields: Object.keys(patch) });
    return Response.json(tool);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const tool = await Tool.findByIdAndDelete(id);
    if (!tool) return Response.json({ error: "Tool not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `tool:${tool.slug}`, { name: tool.name });
    return Response.json({ message: "Tool deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

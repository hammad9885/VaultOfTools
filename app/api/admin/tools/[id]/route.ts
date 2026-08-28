import { connectDB, isDBConnected, isMongoObjectId } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import memoryStore from "@/app/lib/data/memoryStore";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { asBool, asNumber, asStringArray, asCompareData, slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function useMemoryStore(id: string) {
  return !isDBConnected() || !isMongoObjectId(id);
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const allowed = [
      "name", "slug", "category", "categoryId", "subcategory", "toolType", "logo",
      "logoUrl", "bannerUrl",
      "imageUrl", "url", "website", "shortDescription", "fullDescription",
      "description", "pricing", "startingPrice", "billingPeriod", "freePlan",
      "freeTrial", "trialDuration", "rating", "reviews", "features", "pros", "cons",
      "bestFor", "useCases", "tags", "searchKeywords", "compare", "featured", "featuredOrder", "sponsored", "sponsorName",
      "sponsorStartDate", "sponsorEndDate", "sponsorPriority", "sponsorActive",
      "seoTitle", "seoDescription", "status", "publishDate",
    ];

    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    if ("compare" in patch) {
      const normalized = asCompareData(patch.compare);
      if (normalized === null) {
        delete patch.compare;
      } else {
        patch.compare = normalized;
      }
    }

    const bools = ["featured", "sponsored", "sponsorActive", "freePlan", "freeTrial"];
    const numbers = ["rating", "reviews", "featuredOrder", "sponsorPriority"];
    const arrays = ["features", "pros", "cons", "useCases", "tags", "searchKeywords"];

    if (useMemoryStore(id)) {
      const current = await memoryStore.getToolById(id);
      if (!current) return Response.json({ error: "Tool not found" }, { status: 404 });

      if ("slug" in patch) {
        patch.slug = String(patch.slug || slugify(patch.slug || current.name)).trim();
      }
      for (const k of bools) if (k in patch) patch[k] = asBool(patch[k], current[k] ?? false);
      for (const k of numbers) if (k in patch) patch[k] = asNumber(patch[k], current[k] ?? 0);
      for (const k of arrays) if (k in patch) patch[k] = asStringArray(patch[k]);

      const tool = await memoryStore.updateTool(id, patch);
      if (!tool) return Response.json({ error: "Tool not found" }, { status: 404 });
      await logActivity(user.email, "updated", `tool:${tool.slug}`, { fields: Object.keys(patch) });
      return Response.json(tool);
    }

    const tool = await Tool.findById(id);
    if (!tool) return Response.json({ error: "Tool not found" }, { status: 404 });

    if ("slug" in patch) {
      const slug = String(patch.slug || slugify(patch.slug || tool.name)).trim();
      const dup = await Tool.findOne({ slug, _id: { $ne: tool._id } });
      if (dup) return Response.json({ error: `A tool with slug "${slug}" already exists` }, { status: 409 });
      patch.slug = slug;
    }

    for (const k of bools) if (k in patch) patch[k] = asBool(patch[k], tool[k] ?? false);
    for (const k of numbers) if (k in patch) patch[k] = asNumber(patch[k], tool[k] ?? 0);
    for (const k of arrays) if (k in patch) patch[k] = asStringArray(patch[k]);

    Object.assign(tool, patch);

    if (
      "shortDescription" in patch ||
      "description" in patch ||
      "fullDescription" in patch ||
      "desc" in patch
    ) {
      const shortDescription = String(
        tool.shortDescription || tool.desc || tool.description || ""
      ).trim();
      const description = String(
        tool.description || tool.fullDescription || shortDescription
      ).trim();
      tool.shortDescription = shortDescription;
      tool.description = description;
      tool.desc = shortDescription || description;
    }
    if ("logoUrl" in patch && !("logo" in patch) && tool.logoUrl) {
      tool.logo = tool.logoUrl;
    }
    if ("logo" in patch && !tool.logoUrl) {
      tool.logoUrl = tool.logo || null;
    }

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

    if (useMemoryStore(id)) {
      const tool = await memoryStore.deleteTool(id);
      if (!tool) return Response.json({ error: "Tool not found" }, { status: 404 });
      await logActivity(user.email, "deleted", `tool:${tool.slug}`, { name: tool.name });
      return Response.json({ message: "Tool deleted" });
    }

    const tool = await Tool.findByIdAndDelete(id);
    if (!tool) return Response.json({ error: "Tool not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `tool:${tool.slug}`, { name: tool.name });
    return Response.json({ message: "Tool deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

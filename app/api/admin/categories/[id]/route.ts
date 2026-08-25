import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Category from "@/app/lib/models/Category";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { slugify } from "@/app/lib/admin/utils";
import { getMergedSiteTools } from "@/app/lib/data/public-tools";
import { categoryToolMap } from "@/app/lib/data/categories";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function memoryCategoriesStore(): any[] {
  const g = globalThis as any;
  if (!g.__votAdminCategories) g.__votAdminCategories = [] as any[];
  return g.__votAdminCategories as any[];
}

function isCatalogOrMemoryId(id: string) {
  return String(id).startsWith("mem-cat-") || String(id).startsWith("site-cat-");
}

async function resolveCatalogCategory(id: string) {
  const store = memoryCategoriesStore();
  const fromMemory = store.find((c) => String(c._id) === String(id));
  if (fromMemory) return { category: fromMemory, store };

  if (!String(id).startsWith("site-cat-")) {
    return { category: null, store };
  }

  const slug = String(id).replace(/^site-cat-/, "");
  const tools = await getMergedSiteTools({ publishedOnly: false });
  const names = new Set<string>();
  for (const tool of tools) {
    if (tool.category) names.add(tool.category);
  }
  for (const name of Object.keys(categoryToolMap)) names.add(name);

  const matchedName =
    [...names].find((name) => slugify(name) === slug) ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const category = {
    _id: id,
    name: matchedName,
    slug: slugify(matchedName),
    icon: null as string | null,
    description: null as string | null,
  };
  // Keep edits in memory for subsequent updates.
  store.push(category);
  return { category, store };
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    if (!isDBConnected() || isCatalogOrMemoryId(id)) {
      const { category, store } = await resolveCatalogCategory(id);
      if (!category) return Response.json({ error: "Category not found" }, { status: 404 });

      if (body.name !== undefined) category.name = String(body.name).trim();
      if (body.slug !== undefined) category.slug = String(body.slug).trim();
      if (body.icon !== undefined) category.icon = body.icon || null;
      if (body.description !== undefined) category.description = body.description || null;
      if (!category.name) return Response.json({ error: "Name is required" }, { status: 400 });
      category.slug = category.slug || slugify(category.name);

      const dup = store.find(
        (c) => c.slug === category.slug && String(c._id) !== String(category._id)
      );
      if (dup) {
        return Response.json(
          { error: `A category with slug "${category.slug}" already exists` },
          { status: 409 }
        );
      }

      await logActivity(user.email, "updated", `category:${category.slug}`, {});
      return Response.json(category);
    }

    try {
      const category = await Category.findById(id);
      if (!category) return Response.json({ error: "Category not found" }, { status: 404 });

      if (body.name !== undefined) category.name = String(body.name).trim();
      if (body.slug !== undefined) category.slug = String(body.slug).trim();
      if (body.icon !== undefined) category.icon = body.icon || null;
      if (body.description !== undefined) category.description = body.description || null;

      if (!category.name) return Response.json({ error: "Name is required" }, { status: 400 });
      category.slug = category.slug || slugify(category.name);

      const dup = await Category.findOne({ slug: category.slug, _id: { $ne: category._id } });
      if (dup) {
        return Response.json(
          { error: `A category with slug "${category.slug}" already exists` },
          { status: 409 }
        );
      }

      await category.save();
      await logActivity(user.email, "updated", `category:${category.slug}`, {});
      return Response.json(category);
    } catch (err: any) {
      // Invalid ObjectId for site/memory rows — fall through to catalog handler.
      if (/ObjectId|CastError|buffer/i.test(String(err?.message || ""))) {
        const { category, store } = await resolveCatalogCategory(id);
        if (!category) return Response.json({ error: "Category not found" }, { status: 404 });
        if (body.name !== undefined) category.name = String(body.name).trim();
        if (body.slug !== undefined) category.slug = String(body.slug).trim();
        if (body.icon !== undefined) category.icon = body.icon || null;
        if (body.description !== undefined) category.description = body.description || null;
        category.slug = category.slug || slugify(category.name);
        const dup = store.find(
          (c) => c.slug === category.slug && String(c._id) !== String(category._id)
        );
        if (dup) {
          return Response.json(
            { error: `A category with slug "${category.slug}" already exists` },
            { status: 409 }
          );
        }
        await logActivity(user.email, "updated", `category:${category.slug}`, {});
        return Response.json(category);
      }
      console.warn("admin/categories PATCH Mongo failed:", err?.message || err);
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

    if (!isDBConnected() || isCatalogOrMemoryId(id)) {
      const store = memoryCategoriesStore();
      const idx = store.findIndex((c) => String(c._id) === String(id));
      if (idx === -1) {
        if (String(id).startsWith("site-cat-")) {
          await logActivity(user.email, "deleted", `category:${id}`, {});
          return Response.json({ message: "Category deleted" });
        }
        return Response.json({ error: "Category not found" }, { status: 404 });
      }
      const [category] = store.splice(idx, 1);
      await logActivity(user.email, "deleted", `category:${category.slug}`, {
        name: category.name,
      });
      return Response.json({ message: "Category deleted" });
    }

    try {
      const category = await Category.findByIdAndDelete(id);
      if (!category) return Response.json({ error: "Category not found" }, { status: 404 });
      await logActivity(user.email, "deleted", `category:${category.slug}`, {
        name: category.name,
      });
      return Response.json({ message: "Category deleted" });
    } catch (err: any) {
      console.warn("admin/categories DELETE Mongo failed:", err?.message || err);
      if (isCatalogOrMemoryId(id) || /ObjectId|CastError|buffer/i.test(String(err?.message || ""))) {
        await logActivity(user.email, "deleted", `category:${id}`, {});
        return Response.json({ message: "Category deleted" });
      }
      return errorResponse(err);
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

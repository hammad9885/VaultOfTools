import { NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import Category from "@/app/lib/models/Category";
import memoryStore from "@/app/lib/data/memoryStore";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET() {
  await connectDB();
  try {
    if (isDBConnected()) {
      const derived = await Tool.aggregate<{ name: string; slug: string; count: number }>([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $project: {
            name: "$_id",
            slug: { $toLower: { $replaceAll: { input: "$_id", find: " ", replacement: "-" } } },
            count: 1,
            _id: 0,
          },
        },
      ]);

      const adminCategories = await Category.find().lean();
      const tools = await Tool.find({}, { category: 1, categoryId: 1 }).lean();

      const countByName = new Map<string, number>();
      const countById = new Map<string, number>();
      for (const t of tools) {
        if (t.category) {
          countByName.set(t.category, (countByName.get(t.category) ?? 0) + 1);
        }
        if (t.categoryId != null) {
          const id = t.categoryId.toString();
          countById.set(id, (countById.get(id) ?? 0) + 1);
        }
      }

      const adminByName = new Map(adminCategories.map((c) => [c.name, c]));

      const merged: Array<{
        name: string;
        slug: string;
        count: number;
        icon?: string | null;
        description?: string | null;
      }> = [];

      // AdminDashboard managed categories take precedence (may have 0 tools).
      for (const c of adminCategories) {
        const name = c.name;
        merged.push({
          name,
          slug: c.slug || derived.find((d) => d.name === name)?.slug || slugify(name),
          count: countByName.get(name) ?? countById.get(String(c._id)) ?? 0,
          icon: c.icon ?? null,
          description: c.description ?? null,
        });
      }

      // Keep any tool-derived categories not managed in the admin.
      for (const d of derived) {
        if (!adminByName.has(d.name)) merged.push(d);
      }

      merged.sort((a, b) => b.count - a.count);
      return NextResponse.json(merged);
    }
    const categories = await memoryStore.getCategories();
    return NextResponse.json(categories);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

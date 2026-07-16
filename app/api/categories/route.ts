import { NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Category from "@/app/lib/models/Category";
import Tool from "@/app/lib/models/Tool";

// Reads the shared "categories" collection managed by AdminDashboard.
export async function GET() {
  await connectDB();
  try {
    if (!isDBConnected()) return NextResponse.json([]);

    const categories = await Category.find().sort({ name: 1 }).lean();
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

    const result = categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? null,
      description: c.description ?? null,
      createdAt: c.createdAt,
      toolCount: countByName.get(c.name) ?? countById.get(String(c._id)) ?? 0,
    }));

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

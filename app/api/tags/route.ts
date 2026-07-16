import { NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tag from "@/app/lib/models/Tag";
import Tool from "@/app/lib/models/Tool";

// Reads the shared "tags" collection managed by AdminDashboard.
export async function GET() {
  await connectDB();
  try {
    if (!isDBConnected()) return NextResponse.json([]);

    const tags = await Tag.find().sort({ name: 1 }).lean();
    const tools = await Tool.find({}, { tags: 1 }).lean();

    const counts = new Map<string, number>();
    for (const t of tools) {
      for (const n of t.tags || []) {
        if (n) counts.set(n, (counts.get(n) ?? 0) + 1);
      }
    }

    const result = tags.map((tg) => ({
      id: String(tg._id),
      name: tg.name,
      slug: tg.slug,
      createdAt: tg.createdAt,
      toolCount: counts.get(tg.name) ?? 0,
    }));

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

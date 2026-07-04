import { NextResponse } from "next/server";
import { isDBConnected } from "@/app/lib/config/db";
import BlogPost from "@/app/lib/models/BlogPost";
import memoryStore from "@/app/lib/data/memoryStore";
import { posts as dataPosts } from "@/app/lib/data/blog";

export async function GET() {
  try {
    let cats;

    if (isDBConnected()) {
      cats = await BlogPost.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
      ]);
    } else {
      cats = await memoryStore.getBlogCategories();
      if (cats.length === 0) {
        const map: Record<string, number> = {};
        for (const p of dataPosts) {
          map[p.category] = (map[p.category] || 0) + 1;
        }
        cats = Object.entries(map).map(([name, count]) => ({ name, count }));
      }
    }

    return NextResponse.json(cats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

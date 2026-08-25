import { NextResponse } from "next/server";
import { getMergedSitePosts } from "@/app/lib/data/site-posts";

export async function GET() {
  try {
    const posts = await getMergedSitePosts();
    const map: Record<string, number> = {};
    for (const p of posts) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    const cats = Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    return NextResponse.json(cats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

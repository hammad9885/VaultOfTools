import { NextRequest, NextResponse } from "next/server";
import { listPublicTools } from "@/app/lib/data/public-tools";
import { recordActivity } from "@/app/lib/data/tool-activity";
import { getClientIp, checkRateLimit, GUARDS } from "@/app/lib/data/activity-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const { tools, total } = await listPublicTools({
      category,
      search,
      sort,
      skip,
      limit,
      publishedOnly: true,
    });

    // A search that lands on a tool's name is a precise "searches" signal for trending.
    if (search) {
      const limited = checkRateLimit(getClientIp(request), "search", "global", GUARDS.searches);
      const q = search.toLowerCase();
      const matched = limited.allowed
        ? tools
            .filter((t) => t.name.toLowerCase() === q || t.name.toLowerCase().includes(q))
            .slice(0, 3)
        : [];
      for (const t of matched) {
        if (t?.slug) {
          void recordActivity(t.slug, "searches", 1).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      tools,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { listPublicTools } from "@/app/lib/data/public-tools";

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

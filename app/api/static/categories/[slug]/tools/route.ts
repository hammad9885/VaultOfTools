import { NextRequest, NextResponse } from "next/server";
import { listCategoryPublicTools } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const tools = await listCategoryPublicTools(slug, 50);
    return NextResponse.json(tools);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

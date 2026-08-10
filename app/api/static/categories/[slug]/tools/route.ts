import { NextRequest, NextResponse } from "next/server";
import { categoryToolMap } from "@/app/lib/data/categories";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = decodeURIComponent(slug);
  const tools = categoryToolMap[key] || categoryToolMap[slug] || [];
  return NextResponse.json(tools);
}

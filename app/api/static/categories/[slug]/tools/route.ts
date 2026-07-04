import { NextRequest, NextResponse } from "next/server";
import { categoryToolMap } from "@/app/lib/data/categories";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tools = categoryToolMap[slug] || [];
  return NextResponse.json(tools);
}

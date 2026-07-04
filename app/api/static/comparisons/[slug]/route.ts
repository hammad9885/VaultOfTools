import { NextRequest, NextResponse } from "next/server";
import { comparisonDetails } from "@/app/lib/data/comparisons";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = comparisonDetails[slug];
  if (!detail) return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  return NextResponse.json(detail);
}

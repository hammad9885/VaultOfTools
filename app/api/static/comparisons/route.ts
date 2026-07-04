import { NextResponse } from "next/server";
import { allComparisons, alternatives, filterTabs, howItWorks } from "@/app/lib/data/comparisons";

export async function GET() {
  return NextResponse.json({ allComparisons, alternatives, filterTabs, howItWorks });
}

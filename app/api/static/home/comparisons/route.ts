import { NextResponse } from "next/server";

import { comparisons } from "@/app/lib/data/home";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: comparisons,
      meta: {
        total: comparisons.length,
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
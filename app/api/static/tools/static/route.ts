import { NextResponse } from "next/server";
import { fallbackFeatures, fallbackPros, fallbackCons } from "@/app/lib/data/tools";
import { listPopularPublicTools } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trending = await listPopularPublicTools(12);
    return NextResponse.json({
      fallbackFeatures,
      fallbackPros,
      fallbackCons,
      trending,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

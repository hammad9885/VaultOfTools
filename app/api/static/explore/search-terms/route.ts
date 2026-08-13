import { NextResponse } from "next/server";
import { listPublicSearchTerms } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const terms = await listPublicSearchTerms(12);
    return NextResponse.json(terms);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

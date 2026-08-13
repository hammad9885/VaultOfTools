import { NextResponse } from "next/server";
import { listPublicCategories } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await listPublicCategories();
    return NextResponse.json(categories);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

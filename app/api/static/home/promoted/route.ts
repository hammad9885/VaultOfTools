import { NextResponse } from "next/server";
import { listPromotedPublicTools } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await listPromotedPublicTools(8);
    return NextResponse.json(tools);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
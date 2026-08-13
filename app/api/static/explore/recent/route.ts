import { NextResponse } from "next/server";
import { listRecentPublicTools } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await listRecentPublicTools(15);
    return NextResponse.json(tools);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

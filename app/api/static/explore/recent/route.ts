import { NextResponse } from "next/server";
import { recentTools } from "@/app/lib/data/categories";

export async function GET() {
  return NextResponse.json(recentTools);
}

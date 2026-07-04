import { NextResponse } from "next/server";
import { popularTools } from "@/app/lib/data/categories";

export async function GET() {
  return NextResponse.json(popularTools);
}

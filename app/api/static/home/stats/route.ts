import { NextResponse } from "next/server";
import { stats } from "@/app/lib/data/home";

export async function GET() {
  return NextResponse.json(stats);
}

import { NextResponse } from "next/server";
import { fallbackFeatures, fallbackPros, fallbackCons } from "@/app/lib/data/tools";
import { trending } from "@/app/lib/data/home";

export async function GET() {
  return NextResponse.json({ fallbackFeatures, fallbackPros, fallbackCons, trending });
}

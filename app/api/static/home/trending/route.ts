import { NextResponse } from "next/server";
import { trending } from "@/app/lib/data/home";

export async function GET() {
  return NextResponse.json(trending);
}

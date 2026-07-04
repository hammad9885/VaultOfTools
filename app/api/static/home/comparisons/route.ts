import { NextResponse } from "next/server";
import { comparisons } from "@/app/lib/data/home";

export async function GET() {
  return NextResponse.json(comparisons);
}

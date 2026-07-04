import { NextResponse } from "next/server";
import { popularSearchTerms } from "@/app/lib/data/categories";

export async function GET() {
  return NextResponse.json(popularSearchTerms);
}

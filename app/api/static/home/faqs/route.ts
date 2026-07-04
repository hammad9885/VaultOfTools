import { NextResponse } from "next/server";
import { faqs } from "@/app/lib/data/home";

export async function GET() {
  return NextResponse.json(faqs);
}

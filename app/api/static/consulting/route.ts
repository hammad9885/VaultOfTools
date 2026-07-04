import { NextResponse } from "next/server";
import { consulting } from "@/app/lib/data/consulting";

export async function GET() {
  return NextResponse.json(consulting);
}

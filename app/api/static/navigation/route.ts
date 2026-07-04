import { NextResponse } from "next/server";
import { navigation } from "@/app/lib/data/navigation";

export async function GET() {
  return NextResponse.json(navigation);
}

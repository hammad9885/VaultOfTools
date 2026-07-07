import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  try {
    const { slug } = await params;
    const tool = await Tool.findOne({ slug });
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    return NextResponse.json(tool);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

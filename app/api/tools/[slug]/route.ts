import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import memoryStore from "@/app/lib/data/memoryStore";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  try {
    const { slug } = await params;
    let tool;
    if (isDBConnected()) {
      tool = await Tool.findOne({ slug });
    } else {
      tool = await memoryStore.getToolBySlug(slug);
    }
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    return NextResponse.json(tool);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

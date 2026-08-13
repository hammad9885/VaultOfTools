import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import SavedTool from "@/app/lib/models/SavedTool";
import { authenticate } from "@/app/lib/middleware/auth";
import memoryStore from "@/app/lib/data/memoryStore";

function serialize(entry: any) {
  return {
    slug: entry.slug,
    name: entry.name,
    desc: entry.desc || "",
    logo: entry.logo || "",
    category: entry.category || "",
    tags: entry.tags || [],
    savedAt: entry.createdAt,
  };
}

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { user } = await authenticate(request);
    const userId = String(user._id);

    const entries = isDBConnected()
      ? await SavedTool.find({ userId }).sort({ createdAt: -1 })
      : await memoryStore.getSavedTools(userId);

    const tools = entries.map(serialize);
    return NextResponse.json({ tools, slugs: tools.map((t: any) => t.slug) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { user } = await authenticate(request);
    const userId = String(user._id);
    const body = await request.json();
    const slug = String(body?.slug || "").trim();

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const payload = {
      slug,
      name: String(body?.name || slug).slice(0, 120),
      desc: body?.desc ? String(body.desc).slice(0, 500) : undefined,
      logo: body?.logo ? String(body.logo).slice(0, 500) : undefined,
      category: body?.category ? String(body.category).slice(0, 120) : undefined,
      tags: Array.isArray(body?.tags) ? body.tags.slice(0, 10).map(String) : [],
    };

    if (!isDBConnected()) {
      const result = await memoryStore.toggleSavedTool(userId, payload);
      return NextResponse.json({ ...result, slug });
    }

    const existing = await SavedTool.findOne({ userId, slug });
    if (existing) {
      await SavedTool.deleteOne({ userId, slug });
      return NextResponse.json({ saved: false, slug });
    }

    await SavedTool.create({ userId, ...payload });
    return NextResponse.json({ saved: true, slug });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    let sortObj: any = { rating: -1 };
    if (sort === "newest") sortObj = { createdAt: -1 };
    if (sort === "name") sortObj = { name: 1 };

    const skip = (page - 1) * limit;
    const [tools, total] = await Promise.all([
      Tool.find(filter).sort(sortObj).skip(skip).limit(limit),
      Tool.countDocuments(filter),
    ]);

    return NextResponse.json({ tools, total, page, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

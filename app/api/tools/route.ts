import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import memoryStore from "@/app/lib/data/memoryStore";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const filter: any = { category, search, sort };
    const skip = (page - 1) * limit;

    if (isDBConnected()) {
      const mongoFilter: any = {};
      if (category) mongoFilter.category = category;
      if (search) {
        mongoFilter.$or = [
          { name: { $regex: search, $options: "i" } },
          { desc: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }
      let sortObj: any = { rating: -1 };
      if (sort === "newest") sortObj = { createdAt: -1 };
      if (sort === "name") sortObj = { name: 1 };

      const [tools, total] = await Promise.all([
        Tool.find(mongoFilter).sort(sortObj).skip(skip).limit(limit),
        Tool.countDocuments(mongoFilter),
      ]);
      return NextResponse.json({ tools, total, page, pages: Math.ceil(total / limit) });
    }

    const all = await memoryStore.getTools(filter);
    const total = all.length;
    const tools = all.slice(skip, skip + limit);
    return NextResponse.json({ tools, total, page, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

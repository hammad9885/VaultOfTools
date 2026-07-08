import { NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import memoryStore from "@/app/lib/data/memoryStore";

export async function GET() {
  await connectDB();
  try {
    if (isDBConnected()) {
      const categories = await Tool.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $project: {
            name: "$_id",
            slug: { $toLower: { $replaceAll: { input: "$_id", find: " ", replacement: "-" } } },
            count: 1,
            _id: 0,
          },
        },
      ]);
      return NextResponse.json(categories);
    }
    const categories = await memoryStore.getCategories();
    return NextResponse.json(categories);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

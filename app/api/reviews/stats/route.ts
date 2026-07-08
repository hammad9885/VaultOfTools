import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Review from "@/app/lib/models/Review";
import memoryStore from "@/app/lib/data/memoryStore";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get("tool");

    if (isDBConnected()) {
      const match = tool ? { toolSlug: tool } : {};
      const [agg] = await Review.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
            total: { $sum: 1 },
            five: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            four: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            three: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            two: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            one: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          },
        },
      ]);

      if (!agg) {
        return NextResponse.json({ average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      }

      return NextResponse.json({
        average: Math.round(agg.average * 10) / 10,
        total: agg.total,
        breakdown: { 5: agg.five, 4: agg.four, 3: agg.three, 2: agg.two, 1: agg.one },
      });
    }

    const stats = await memoryStore.getReviewStats(tool || undefined);
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

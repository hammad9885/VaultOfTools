import { NextResponse } from "next/server";
import { stats as fallbackStats } from "@/app/lib/data/home";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Category from "@/app/lib/models/Category";
import Tool from "@/app/lib/models/Tool";
import Review from "@/app/lib/models/Review";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    if (isDBConnected()) {
      const [categoryCount, toolCount, reviewCount] = await Promise.all([
        Category.countDocuments().catch(() => 0),
        Tool.countDocuments({ status: "approved" }).catch(() => 0),
        Review.countDocuments().catch(() => 0),
      ]);

      const effectiveCatCount = categoryCount > 0 ? categoryCount : 10;
      const effectiveToolCount = toolCount > 0 ? toolCount : 10;
      const effectiveReviewCount = reviewCount > 0 ? reviewCount : 50;

      return NextResponse.json([
        { value: String(effectiveToolCount), suffix: "+", label: "AI Tools", icon: "Cpu" },
        { value: String(effectiveCatCount), suffix: "+", label: "Categories", icon: "Layers" },
        { value: String(effectiveReviewCount), suffix: "+", label: "Reviews", icon: "Star" },
        { value: "1000", suffix: "+", label: "Monthly Traffic", icon: "Users" },
      ]);
    }
  } catch {
    // fallback to static home stats
  }

  return NextResponse.json(fallbackStats);
}

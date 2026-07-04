import { NextResponse } from "next/server";
import { catIcons, trustFeatures, featuredArticle } from "@/app/lib/data/blog";
import { popularComparisonsSidebar, trendingToolsSidebar } from "@/app/lib/data/navigation";

export async function GET() {
  return NextResponse.json({ catIcons, trustFeatures, featuredArticle, popularComparisonsSidebar, trendingToolsSidebar });
}

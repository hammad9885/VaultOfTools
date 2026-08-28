import { NextRequest, NextResponse } from "next/server";
import { getPublicToolBySlug } from "@/app/lib/data/public-tools";
import {
  getEngagement,
  recordToolClick,
  toggleToolUpvote,
} from "@/app/lib/data/tool-engagement";
import { getActivityBuckets, computeTrendScore, recordActivity } from "@/app/lib/data/tool-activity";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const tool = await getPublicToolBySlug(slug);
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    const [engagement, buckets] = await Promise.all([
      getEngagement(slug),
      getActivityBuckets(slug),
    ]);
    const organicScore = computeTrendScore(buckets, {
      rating: tool.rating,
      createdAt: tool.createdAt,
    });
    return NextResponse.json({
      ...tool,
      clicks: engagement.clicks,
      upvotes: engagement.upvotes,
      trendScore: organicScore,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const tool = await getPublicToolBySlug(slug);
    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const action = String(body?.action || "click").toLowerCase();

    if (action === "click") {
      const engagement = await recordToolClick(slug);
      // A page open counts as one view in the trending ledger.
      await recordActivity(slug, "views", 1);
      return NextResponse.json({ ok: true, ...engagement });
    }

    if (action === "visit") {
      // The "Visit website" button is a stronger signal than a page open.
      await recordActivity(slug, "visits", 1);
      return NextResponse.json({ ok: true });
    }

    if (action === "upvote") {
      const engagement = await toggleToolUpvote(slug, "up");
      return NextResponse.json({ ok: true, ...engagement });
    }

    if (action === "remove-upvote" || action === "downvote") {
      const engagement = await toggleToolUpvote(slug, "down");
      return NextResponse.json({ ok: true, ...engagement });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}

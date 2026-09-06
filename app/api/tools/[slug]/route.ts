import { NextRequest, NextResponse } from "next/server";
import { getPublicToolBySlug } from "@/app/lib/data/public-tools";
import {
  getEngagement,
  recordToolClick,
  toggleToolUpvote,
} from "@/app/lib/data/tool-engagement";
import { getActivityBuckets, computeTrendScore, recordActivity } from "@/app/lib/data/tool-activity";
import {
  getClientIp,
  checkRateLimit,
  GUARDS,
  hasVoted,
  recordVoted,
  removeVoted,
  isLikelyBot,
} from "@/app/lib/data/activity-guard";

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
    const ip = getClientIp(request);

    // Basic bot/spam protection on every write action.
    if (isLikelyBot(request)) {
      return NextResponse.json(
        { ok: false, throttled: true, reason: "bot_detected", remaining: 0, resetAt: Date.now() + 3600_000 },
        { status: 429 }
      );
    }

    if (action === "click") {
      const limited = checkRateLimit(ip, "view", slug, GUARDS.views);
      if (!limited.allowed) {
        return NextResponse.json(
          { ok: false, throttled: true, reason: limited.reason, remaining: 0, resetAt: limited.resetAt },
          { status: 429 }
        );
      }
      // One unique view per browser session (client also enforces this); the
      // rate limit above protects against refresh/bot spamming.
      const engagement = await recordToolClick(slug);
      await recordActivity(slug, "views", 1);
      return NextResponse.json({ ok: true, ...engagement });
    }

    if (action === "visit") {
      const limited = checkRateLimit(ip, "visit", slug, GUARDS.visits);
      if (!limited.allowed) {
        return NextResponse.json(
          { ok: false, throttled: true, reason: limited.reason, remaining: 0, resetAt: limited.resetAt },
          { status: 429 }
        );
      }
      await recordActivity(slug, "visits", 1);
      return NextResponse.json({ ok: true });
    }

    // Determine voter identity for votes (VOT-SEC-012)
    let voterId = "";
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { getJwtSecret } = await import("@/app/lib/config/secrets");
        const jwt = (await import("jsonwebtoken")).default;
        const decoded = jwt.verify(authHeader.replace("Bearer ", ""), getJwtSecret()) as { id: string };
        if (decoded?.id) voterId = `user:${decoded.id}`;
      } catch {}
    }
    if (!voterId) {
      const cookieVoter = request.cookies.get("vot_voter_id")?.value;
      if (cookieVoter && /^[a-zA-Z0-9_-]{16,64}$/.test(cookieVoter)) {
        voterId = `cookie:${cookieVoter}`;
      } else {
        voterId = `ip:${ip}`;
      }
    }

    if (action === "upvote") {
      const limited = checkRateLimit(ip, "vote", slug, GUARDS.votes);
      if (!limited.allowed) {
        return NextResponse.json(
          { ok: false, throttled: true, reason: limited.reason, remaining: 0, resetAt: limited.resetAt },
          { status: 429 }
        );
      }
      // Server-side duplicate vote prevention: one vote per voter per tool.
      if (await hasVoted(slug, voterId)) {
        const engagement = await getEngagement(slug);
        return NextResponse.json({ ok: true, ...engagement, voted: true, duplicate: true });
      }
      await recordVoted(slug, voterId);
      const engagement = await toggleToolUpvote(slug, "up");
      return NextResponse.json({ ok: true, ...engagement, voted: true });
    }

    if (action === "remove-upvote" || action === "downvote") {
      const wasVoted = await hasVoted(slug, voterId);
      await removeVoted(slug, voterId);
      const engagement = wasVoted
        ? await toggleToolUpvote(slug, "down")
        : await getEngagement(slug);
      return NextResponse.json({ ok: true, ...engagement, voted: false });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}
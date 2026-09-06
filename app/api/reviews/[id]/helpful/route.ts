import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Review from "@/app/lib/models/Review";
import memoryStore from "@/app/lib/data/memoryStore";
import { optionalAuth } from "@/app/lib/middleware/auth";
import {
  getClientIp,
  checkRateLimit,
  hasVotedHelpful,
  recordVotedHelpful,
  GUARDS,
} from "@/app/lib/data/activity-guard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const { id } = await params;
    const ip = getClientIp(request);

    // Rate limit helpful requests (VOT-SEC-010)
    const rateCheck = checkRateLimit(ip, "helpful", id, GUARDS.helpful);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many votes. Please wait a moment." },
        { status: 429 }
      );
    }

    // Determine voter identity: user ID if authenticated, else client IP
    const { user } = await optionalAuth(request);
    const voterId = user?._id ? `user:${user._id}` : `anon:${ip}`;

    // Deduplicate: same voter cannot repeatedly increment (VOT-SEC-010)
    if (hasVotedHelpful(id, voterId)) {
      if (isDBConnected()) {
        const review = await Review.findById(id);
        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
        return NextResponse.json({ ...review.toObject(), alreadyVoted: true });
      }
      const review = (memoryStore as any).getReviewById?.(id);
      return NextResponse.json({ ...(review || {}), alreadyVoted: true });
    }

    recordVotedHelpful(id, voterId);

    if (isDBConnected()) {
      const review = await Review.findByIdAndUpdate(id, { $inc: { helpful: 1 } }, { new: true });
      if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
      return NextResponse.json(review);
    }

    const review = await memoryStore.incrementHelpful(id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    return NextResponse.json(review);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Review from "@/app/lib/models/Review";
import { authenticate, optionalAuth } from "@/app/lib/middleware/auth";
import memoryStore from "@/app/lib/data/memoryStore";

const SORT_MAP: Record<string, any> = {
  newest: { createdAt: -1 },
  helpful: { helpful: -1 },
  rating: { rating: -1 },
};

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get("tool");
    const rating = searchParams.get("rating");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const filter: any = { toolSlug: tool, rating, search, sort };
    const skip = (page - 1) * limit;

    if (isDBConnected()) {
      const mongoFilter: any = {};
      if (tool) mongoFilter.toolSlug = tool;
      if (rating) mongoFilter.rating = Number(rating);
      if (search) {
        mongoFilter.$or = [
          { text: { $regex: search, $options: "i" } },
          { toolName: { $regex: search, $options: "i" } },
        ];
      }

      const [reviews, total] = await Promise.all([
        Review.find(mongoFilter)
          .sort(SORT_MAP[sort] || SORT_MAP.newest)
          .skip(skip)
          .limit(limit)
          .populate("userId", "displayName photoURL email"),
        Review.countDocuments(mongoFilter),
      ]);

      const mapped = reviews.map((r: any) => ({
        id: r._id,
        toolSlug: r.toolSlug,
        toolName: r.toolName,
        category: r.category,
        userId: r.userId?._id,
        rating: r.rating,
        text: r.text,
        helpful: r.helpful,
        createdAt: r.createdAt,
        user: r.userId
          ? { displayName: r.userId.displayName || r.userId.email?.split("@")[0], photoURL: r.userId.photoURL }
          : null,
      }));

      return NextResponse.json({ reviews: mapped, total, page, pages: Math.ceil(total / limit) });
    }

    const all = await memoryStore.getReviews(filter);
    const total = all.length;
    const raw = all.slice(skip, skip + limit);
    const reviews = await Promise.all(
      raw.map(async (r: any) => {
        const u = await memoryStore.findUserById(r.userId);
        return {
          id: r._id,
          toolSlug: r.toolSlug,
          toolName: r.toolName,
          category: r.category,
          userId: r.userId,
          rating: r.rating,
          text: r.text,
          helpful: r.helpful,
          createdAt: r.createdAt,
          user: u ? { displayName: u.displayName, photoURL: u.photoURL } : null,
        };
      })
    );
    return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { user } = await authenticate(request);
    const { toolSlug, toolName, category, rating, text } = await request.json();

    if (!toolSlug || !toolName || !rating || !text) {
      return NextResponse.json({ error: "toolSlug, toolName, rating and text are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
    }

    if (isDBConnected()) {
      const existing = await Review.findOne({ userId: user._id, toolSlug });
      if (existing) {
        return NextResponse.json({ error: "You already reviewed this tool" }, { status: 400 });
      }

      const review = await Review.create({
        toolSlug, toolName, category, userId: user._id, rating, text,
      });

      const populated = await review.populate("userId", "displayName photoURL email");

      return NextResponse.json({
        id: populated._id,
        toolSlug: populated.toolSlug,
        toolName: populated.toolName,
        category: populated.category,
        userId: populated.userId?._id,
        rating: populated.rating,
        text: populated.text,
        helpful: populated.helpful,
        createdAt: populated.createdAt,
        user: populated.userId
          ? { displayName: populated.userId.displayName || populated.userId.email?.split("@")[0], photoURL: populated.userId.photoURL }
          : null,
      }, { status: 201 });
    }

    const existing = await memoryStore.getReviews({ toolSlug });
    const dup = existing.find((r: any) => r.userId === user._id);
    if (dup) {
      return NextResponse.json({ error: "You already reviewed this tool" }, { status: 400 });
    }

    const review = await memoryStore.createReview({
      toolSlug, toolName, category, userId: user._id, rating, text,
    });

    const u = await memoryStore.findUserById(user._id);
    return NextResponse.json({
      id: review._id,
      toolSlug: review.toolSlug,
      toolName: review.toolName,
      category: review.category,
      userId: review.userId,
      rating: review.rating,
      text: review.text,
      helpful: review.helpful,
      createdAt: review.createdAt,
      user: u ? { displayName: u.displayName, photoURL: u.photoURL } : null,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}

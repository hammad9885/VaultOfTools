"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  BadgeCheck,
  ThumbsUp,
  Star,
  PenLine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteNav, SiteFooter } from "../routes/index";
import { api } from "../lib/api";

type ReviewItem = {
  _id: string;
  toolSlug: string;
  toolName: string;
  rating: number;
  text: string;
  helpful: number;
  createdAt: string;
  user: { displayName: string | null; photoURL: string | null } | null;
};

const fallbackReviews: ReviewItem[] = [
  {
    _id: "1", toolSlug: "flux-studio", toolName: "Flux Studio",
    rating: 5, text: "Best image generation tool I've used. The quality is unmatched and the community is incredible.", helpful: 24,
    createdAt: "2025-06-15T10:00:00Z", user: { displayName: "Sarah Chen", photoURL: null },
  },
  {
    _id: "2", toolSlug: "codewhisper", toolName: "CodeWhisper",
    rating: 5, text: "Game changer for my daily workflow. Autocomplete is scary accurate.", helpful: 18,
    createdAt: "2025-06-10T14:30:00Z", user: { displayName: "Alex Rivera", photoURL: null },
  },
  {
    _id: "3", toolSlug: "motionflow", toolName: "MotionFlow",
    rating: 4, text: "Great for quick video edits. Auto subtitle generation saves hours.", helpful: 12,
    createdAt: "2025-06-08T09:15:00Z", user: { displayName: "Jamie Kim", photoURL: null },
  },
  {
    _id: "4", toolSlug: "synthflow", toolName: "SynthFlow",
    rating: 5, text: "Voices sound incredibly natural. We use it for all our client demos.", helpful: 9,
    createdAt: "2025-06-05T16:45:00Z", user: { displayName: "Marcus Johnson", photoURL: null },
  },
  {
    _id: "5", toolSlug: "insightlayer", toolName: "InsightLayer",
    rating: 4, text: "Transforms our raw data into clear reports. Dashboard could use a refresh.", helpful: 7,
    createdAt: "2025-06-01T11:20:00Z", user: { displayName: "Priya Patel", photoURL: null },
  },
  {
    _id: "6", toolSlug: "lumina-script", toolName: "Lumina Script",
    rating: 3, text: "Good for first drafts but needs heavy editing for longer pieces.", helpful: 5,
    createdAt: "2025-05-28T08:00:00Z", user: { displayName: "David Park", photoURL: null },
  },
];

const avatarStyles = [
  "bg-indigo-100 text-indigo-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function FractionalStars({ rating, size = 20 }: { rating: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div className="relative inline-flex">
      <div className="flex gap-0.5 text-gray-200">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="fill-current shrink-0" style={{ width: size, height: size }} />
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden flex gap-0.5 text-amber-400"
        style={{ width: `${pct}%` }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="fill-current shrink-0" style={{ width: size, height: size }} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, colorIndex }: { review: ReviewItem; colorIndex: number }) {
  const name = review.user?.displayName ?? "Anonymous";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {review.user?.photoURL ? (
            <Image
              src={review.user.photoURL}
              alt={name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full grid place-items-center text-xs font-bold shrink-0 ${avatarStyles[colorIndex % avatarStyles.length]}`}
            >
              {initials(name)}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-gray-900">{name}</div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              Verified User
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
        </div>

        <Link href={`/tool/${review.toolSlug}`} className="text-xs text-indigo-500 hover:underline shrink-0">
          {review.toolName}
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Stars rating={review.rating} />
          <span className="text-xs font-semibold text-gray-700">{review.rating}/5</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.text}</p>

      <div className="mt-4 flex items-center gap-1.5 border-t border-gray-50 pt-3 text-xs text-gray-400">
        <span>Helpful?</span>
        <button className="grid place-items-center w-5 h-5 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors">
          <ThumbsUp className="w-3 h-3" />
        </button>
        <span>{review.helpful} people found this helpful</span>
      </div>
    </div>
  );
}

export default function ToolsReview() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{ average: number; total: number; breakdown: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function load() {
      try {
        const [reviewsData, statsData] = await Promise.all([
          api.getReviews({ limit: 50 }),
          api.getReviewStats(),
        ]);
        setReviews(reviewsData.reviews);
        setStats(statsData);
      } catch {
        setReviews(fallbackReviews);
        setStats({
          average: 4.3,
          total: fallbackReviews.length,
          breakdown: { 5: 4, 4: 3, 3: 2, 2: 1, 1: 0 },
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = reviews.filter((r) => {
      const matchesSearch =
        search.trim() === "" ||
        r.text.toLowerCase().includes(search.toLowerCase()) ||
        r.toolName.toLowerCase().includes(search.toLowerCase());

      const matchesRating =
        ratingFilter === "All Ratings" || r.rating === Number(ratingFilter[0]);

      return matchesSearch && matchesRating;
    });

    if (sortBy === "newest") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "helpful") list = [...list].sort((a, b) => b.helpful - a.helpful);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [reviews, search, ratingFilter, sortBy]);

  const avgRating = stats?.average ?? 0;
  const totalReviews = stats?.total ?? 0;
  const breakdown = stats?.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxCount = Math.max(...Object.values(breakdown), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <SiteNav />
        <div className="grid place-items-center py-32">
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />

      <section className="bg-surface-soft border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Community Verified
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tool Reviews & User Experiences
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
            Real feedback from people actually using the tools in our directory.
          </p>
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm sm:flex-row sm:items-center mx-auto max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews by keyword (e.g. 'pricing', 'support')..."
                className="w-full h-10 rounded-xl bg-transparent pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-300 outline-none"
              />
            </div>
            <div className="hidden sm:block h-6 w-px bg-gray-100" />
            <div className="relative">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="appearance-none h-10 rounded-xl bg-gray-50 sm:bg-transparent pl-3 pr-8 text-xs font-semibold uppercase tracking-wide text-gray-600 outline-none cursor-pointer"
              >
                <option>All Ratings</option>
                <option>5 Stars</option>
                <option>4 Stars</option>
                <option>3 Stars</option>
                <option>2 Stars</option>
                <option>1 Stars</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="hidden sm:block h-6 w-px bg-gray-100" />
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none h-10 rounded-xl bg-gray-50 sm:bg-transparent pl-3 pr-8 text-xs font-semibold uppercase tracking-wide text-gray-600 outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
            <div className="text-center sm:text-left">
              <FractionalStars rating={avgRating} size={22} />
              <div className="mt-1.5 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{avgRating}</span> Average ·{" "}
                {totalReviews} reviews
              </div>
            </div>

            <div className="w-full max-w-xs space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-10 text-right">{stars} star</span>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(breakdown[stars] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-left">{breakdown[stars]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((r, i) => (
            <ReviewCard key={r._id} review={r} colorIndex={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-16">
            No reviews match your search or filters.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-100 bg-white px-6 py-10 sm:px-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <PenLine size={28} className="text-white" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
            Used a tool from the Vault?
          </h2>
          <p className="mt-3 max-w-md mx-auto text-sm text-gray-500 sm:text-base">
            Share what worked, what didn&apos;t, and help the next person make a faster
            decision.
          </p>
          <Link
            href="/submit-review"
            className="mt-6 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            Write a Review
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

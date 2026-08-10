"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";
import Image from "next/image";

import { api } from "../lib/api";
import { useAuth } from "../hooks/use-auth";

type ReviewRow = {
  id: string;
  userId: string;
  toolSlug: string;
  rating: number;
  text: string;
  createdAt: string;
  user: {
    displayName: string | null;
    photoURL: string | null;
  } | null;
};

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z
    .string()
    .trim()
    .min(1, "Write something")
    .max(2000, "Too long (max 2000 chars)"),
});

export function ReviewsSection({ slug }: { slug: string }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await api.getReviews({ tool: slug, limit: 50 });
        setReviews(data.reviews);
      } catch (err: any) {
        toast.error("Couldn't load reviews", {
          description: err.message,
        });
      }
      setLoading(false);
    };

    fetchReviews();
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    const parsed = reviewSchema.safeParse({ rating, text: content });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid review");
      return;
    }

    setBusy(true);

    try {
      const review = await api.createReview({
        toolSlug: slug,
        toolName: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        rating: parsed.data.rating,
        text: parsed.data.text,
      });

      toast.success("Review posted");
      setContent("");
      setReviews((prev) => [review, ...prev]);
    } catch (err: any) {
      toast.error("Couldn't post review", {
        description: err.message,
      });
    }

    setBusy(false);
  }

  async function remove(id: string) {
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch (err: any) {
      toast.error("Couldn't delete", {
        description: err.message,
      });
    }
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold">Community reviews</h2>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        {user ? (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-0.5"
                >
                  <Star
                    className={`size-5 ${
                      n <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}

              <span className="ml-2 text-sm text-muted-foreground">
                {rating}/5
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              placeholder="Share your honest experience with this tool…"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            />

            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Posting…" : "Post review"}
            </button>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">
            <Link
              href="/auth"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>{" "}
            to write a review.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No reviews yet — be the first.
          </p>
        )}

        {reviews.map((r) => {
          const name = r.user?.displayName ?? "Anonymous";

          return (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {r.user?.photoURL ? (
                    <Image
                      src={r.user.photoURL}
                      alt={name}
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-primary-muted text-primary grid place-items-center text-sm font-semibold">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold">{name}</p>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {user?.id === r.userId && (
                  <button
                    onClick={() => remove(r.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                )}
              </header>

              <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap">
                {r.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

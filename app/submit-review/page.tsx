"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { SiteNav, SiteFooter } from "../routes/index";
import { api } from "../lib/api";
import { useAuth } from "../hooks/use-auth";

export default function SubmitReviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [toolSlug, setToolSlug] = useState("");
  const [toolName, setToolName] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit a review");
      router.push("/login");
      return;
    }

    if (!toolSlug || !toolName || !text) {
      toast.error("Tool name, slug and review text are required");
      return;
    }

    setBusy(true);
    try {
      await api.createReview({
        toolSlug: toolSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        toolName: toolName.trim(),
        category: category.trim() || undefined,
        rating,
        text: text.trim(),
      });
      setDone(true);
      toast.success("Review submitted!");
    } catch (err: any) {
      toast.error("Couldn't submit review", {
        description: err.message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Write a Review
          </h1>
          <p className="mt-3 text-muted-foreground">
            Share your experience and help others make better decisions.
          </p>
        </header>

        {done ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
            <h2 className="text-xl font-bold text-foreground">
              Thanks for your review!
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Your review helps the community.
            </p>
            <button
              onClick={() => {
                setDone(false);
                setToolSlug("");
                setToolName("");
                setCategory("");
                setRating(5);
                setText("");
              }}
              className="mt-6 text-sm text-primary hover:underline"
            >
              Write another review
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium text-foreground">Tool name *</span>
                <input
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="e.g. Flux Studio"
                  required
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Tool slug *</span>
                <input
                  value={toolSlug}
                  onChange={(e) => setToolSlug(e.target.value)}
                  placeholder="e.g. flux-studio"
                  required
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Category</span>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Image Generation"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-foreground">Rating *</span>
              <div className="mt-1.5 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="p-0.5"
                  >
                    <Star
                      className={`size-7 ${
                        n <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">Your review *</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                maxLength={2000}
                required
                placeholder="What did you like or dislike? Would you recommend it?"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
              />
              <span className="mt-1 text-xs text-muted-foreground">{text.length}/2000</span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

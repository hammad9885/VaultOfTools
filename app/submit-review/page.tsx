"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Star, Lock, LogIn, UserCircle2 } from "lucide-react";
import { SiteNav, SiteFooter } from "../routes/index";
import { api } from "../lib/api";
import { useAuth } from "../hooks/use-auth";
import { signInWithGoogle, signInWithEmail } from "../lib/auth";
import { ToolSelector, type ToolOption } from "../components/ToolSelector";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .95 4.95L3.97 7.28c.68-1.85 2.44-3.09 4.48-3.7z" />
    </svg>
  );
}

function SignInRequiredBanner({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setBusy(true);
    try {
      const profile = await signInWithGoogle();
      if (!profile) return;
      onSignedIn();
      toast.success("Signed in with Google");
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      toast.error("Google sign-in failed", {
        description: raw.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?/gi, ""),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      onSignedIn();
      toast.success("Signed in");
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Sign-in failed.";
      toast.error("Sign-in failed", {
        description: raw.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?/gi, ""),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700">
          <Lock size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-amber-900">Sign In Required</h2>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            You need an account before you can post a review. Sign in below — the form
            unlocks immediately and your review is submitted with your identity attached.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
        >
          <GoogleIcon /> Sign In with Google
        </button>

        <button
          type="button"
          onClick={() => setShowEmailForm((v) => !v)}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
        >
          <LogIn size={16} /> Sign In with Email
        </button>

        {showEmailForm && (
          <form onSubmit={handleEmail} className="space-y-3 rounded-xl border border-amber-200 bg-white p-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-amber-800">
          No account yet?{" "}
          <Link href="/login" className="font-semibold underline underline-offset-2">
            Create one on the sign-in page
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SubmitReviewPage() {
  const { user, loading, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [tool, setTool] = useState<ToolOption | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const signedIn = Boolean(user);
  const displayName = user?.displayName || user?.email || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!signedIn) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!tool?.slug) {
      toast.error("Please select a tool from the list");
      return;
    }

    if (!text.trim()) {
      toast.error("Please write your review");
      return;
    }

    setBusy(true);
    try {
      await api.createReview({
        toolSlug: tool.slug,
        toolName: tool.name,
        category: tool.category || undefined,
        rating,
        text: text.trim(),
      });
      setDone(true);
      toast.success("Review submitted!");
    } catch (err: unknown) {
      toast.error("Couldn't submit review", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
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
                setTool(null);
                setRating(5);
                setText("");
              }}
              className="mt-6 text-sm text-primary hover:underline"
            >
              Write another review
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {!loading && !signedIn && (
              <SignInRequiredBanner onSignedIn={() => refresh()} />
            )}

            {loading && (
              <div className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
                Checking your session…
              </div>
            )}

            {signedIn && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <UserCircle2 size={18} className="shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-900">
                  Posting review as{" "}
                  <span className="font-semibold">{displayName}</span>
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-8"
            >
              <fieldset disabled={!signedIn || loading} className="space-y-5">
                <ToolSelector value={tool} onChange={setTool} disabled={!signedIn || loading} />

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
                  disabled={busy || !signedIn || loading}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {busy ? "Submitting…" : "Submit Review"}
                </button>
              </fieldset>

              {!signedIn && !loading && (
                <p className="text-center text-xs text-muted-foreground">
                  Submission is disabled until you sign in.
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
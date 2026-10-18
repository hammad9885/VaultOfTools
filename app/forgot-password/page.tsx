"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { sendPasswordReset } from "../lib/auth";
import { api, notifyAdminInbox } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      // 1. Firebase official password reset email to user's Gmail
      await sendPasswordReset(trimmed).catch((err: any) => {
        console.warn("Firebase reset email notice:", err?.message || err);
      });

      // 2. Backend token generation and server-side alert
      await api.resetPassword({ email: trimmed, action: "request" }).catch(() => {});

      // 3. Admin inbox notification
      notifyAdminInbox(`Password Reset Requested: ${trimmed}`, {
        event: "Password Reset Request",
        email: trimmed,
        time: new Date().toISOString(),
      });

      setSent(true);
      toast.success("Reset link sent!", {
        description: `Check your Gmail inbox for ${trimmed}.`,
      });
    } catch (err: any) {
      const msg = err?.message || "Could not send reset email. Please try again.";
      setError(msg);
      toast.error("Error sending reset link", { description: msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-blue-600"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-500/20">
              VT
            </span>
            <span>Vault<span className="text-slate-900"> of Tools</span></span>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Check your email
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                We have sent a password reset link to:
                <br />
                <strong className="font-semibold text-slate-900">{email}</strong>
              </p>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-xs leading-5 text-slate-500">
                <p className="font-semibold text-slate-700">Next steps:</p>
                <ol className="mt-1 list-decimal pl-4 space-y-1">
                  <li>Open your email inbox (and check the spam/junk folder if needed).</li>
                  <li>Click on the <strong>Reset Password</strong> link inside the email.</li>
                  <li>Enter your new password and sign in.</li>
                </ol>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">
                  <Mail size={22} />
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Forgot password?
                </h1>
                <p className="mt-1.5 text-sm text-slate-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-800">Your email address</span>
                  <div className="relative mt-1.5">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending link…
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

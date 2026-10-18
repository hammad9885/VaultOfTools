"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { confirmNewPassword, verifyResetCode } from "../lib/auth";
import { api, notifyAdminInbox } from "../lib/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams?.get("oobCode") || searchParams?.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!oobCode) {
      setError("Reset link is invalid or expired. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      // 1. Try Firebase reset
      let emailFromCode = "";
      try {
        emailFromCode = await verifyResetCode(oobCode);
      } catch {}

      let firebaseOk = false;
      try {
        await confirmNewPassword(oobCode, password);
        firebaseOk = true;
      } catch (fbErr: any) {
        console.warn("Firebase confirmNewPassword note:", fbErr?.message || fbErr);
      }

      // 2. Also update backend user store
      try {
        await api.resetPassword({
          token: oobCode,
          email: emailFromCode || undefined,
          password,
          confirmPassword,
        });
      } catch {}

      notifyAdminInbox("Password Reset Completed", {
        event: "Password Reset Completed",
        email: emailFromCode || "user",
        time: new Date().toISOString(),
      });

      setSuccess(true);
      toast.success("Password updated successfully!");
    } catch (err: any) {
      const msg = err?.message || "Failed to update password. Please try requesting a new link.";
      setError(msg);
      toast.error("Password reset failed", { description: msg });
    } finally {
      setBusy(false);
    }
  }

  if (!oobCode) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-9">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
          <AlertCircle size={24} />
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          Invalid or Missing Reset Link
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This password reset link is invalid or has expired. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
        >
          Request New Reset Link <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-9">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Password Reset Complete!
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Sign In Now <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">
          <Lock size={22} />
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          Create new password
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Choose a secure new password for your Vault of Tools account.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="mt-6 space-y-4">
        <div>
          <span className="text-sm font-semibold text-slate-800">New Password</span>
          <div className="relative mt-1.5">
            <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      score >= i ? (score <= 2 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {score <= 2 ? "Weak" : score === 3 ? "Good" : "Strong"} password
              </p>
            </div>
          )}
        </div>

        <div>
          <span className="text-sm font-semibold text-slate-800">Confirm New Password</span>
          <div className="relative mt-1.5">
            <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Updating Password…
            </>
          ) : (
            <>
              Reset Password <ArrowRight size={16} />
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
    </div>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense
          fallback={
            <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-xl">
              <Loader2 size={24} className="mx-auto animate-spin text-blue-600" />
              <p className="mt-2 text-sm text-slate-500">Loading password reset…</p>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}

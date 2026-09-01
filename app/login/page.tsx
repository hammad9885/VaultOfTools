"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  completeGoogleRedirectIfAny,
  sendPasswordReset,
  confirmNewPassword,
  verifyResetCode,
} from "../lib/auth";
import { api } from "../lib/api";
import Link from "next/link";

type AuthMode = "signin" | "signup" | "forgot";

function friendlyAuthError(err: unknown): string {
  if (!(err instanceof Error)) return "Something went wrong.";
  const raw = err.message || "";
  const codeMatch = raw.match(/auth\/[a-z0-9-]+/i);
  const code = codeMatch ? codeMatch[0].toLowerCase() : "";

  const map: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 8 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-login-credentials": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/popup-blocked": "Popup blocked. Allow popups for this site.",
    "auth/unauthorized-domain":
      "This domain is not allowed in Firebase. Add localhost in Firebase Auth settings.",
    "auth/operation-not-allowed": "This sign-in method is disabled in Firebase Console.",
    "auth/expired-action-code": "This reset link has expired. Request a new one.",
    "auth/invalid-action-code": "This reset link is invalid or already used.",
    "auth/missing-password": "Please enter a new password.",
  };

  if (code && map[code]) return map[code];

  return (
    raw
      .replace(/^Firebase:\s*/i, "")
      .replace(/\s*\(auth\/[^)]+\)\.?/gi, "")
      .trim() || "Check your email and password."
  );
}

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength = 8,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      {label ? <span className="text-sm font-medium text-foreground">{label}</span> : null}
      <div className={label ? "relative mt-1.5" : "relative"}>
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[100dvh] place-items-center bg-background">
          <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { user, loading, refresh, setSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") || "";
  const resetMode = searchParams.get("mode") === "resetPassword" || Boolean(oobCode);

  const [mode, setMode] = useState<AuthMode>(resetMode ? "forgot" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const score = useMemo(() => passwordScore(password), [password]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const redirected = await completeGoogleRedirectIfAny();
        if (cancelled || !redirected) return;
        setSession(redirected, api.getToken());
        toast.success("Signed in with Google");
        router.replace(redirected?.role === "super_admin" ? "/admin" : "/");
      } catch {
        // ignore redirect completion errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, setSession]);

  useEffect(() => {
    if (!loading && user && mode !== "forgot") {
      router.replace(user.role === "super_admin" ? "/admin" : "/");
    }
  }, [loading, user, router, mode]);

  useEffect(() => {
    if (!oobCode) return;
    setMode("forgot");
    verifyResetCode(oobCode)
      .then((accountEmail) => {
        setEmail(accountEmail);
      })
      .catch((err) => {
        setError(friendlyAuthError(err));
      });
  }, [oobCode]);

  function finishLogin(profile: any, message = "Signed in") {
    if (profile) setSession(profile, api.getToken());
    toast.success(message);
    router.replace(profile?.role === "super_admin" ? "/admin" : "/");
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      const profile = await signInWithGoogle();
      if (!profile) return;
      finishLogin(profile, "Signed in with Google");
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      toast.error("Google sign-in failed", { description: msg });
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < (mode === "signin" ? 6 : 8)) {
      setError(`Password must be at least ${mode === "signin" ? 6 : 8} characters`);
      toast.error(`Password must be at least ${mode === "signin" ? 6 : 8} characters`);
      return;
    }

    setBusy(true);
    try {
      let profile;
      if (mode === "signup") {
        profile = await signUpWithEmail(email, password, displayName || undefined);
      } else {
        profile = await signInWithEmail(email, password);
      }
      await refresh();
      finishLogin(profile, mode === "signup" ? "Account created" : "Signed in");
    } catch (err: unknown) {
      const msg = friendlyAuthError(err);
      setError(msg);
      toast.error(mode === "signup" ? "Sign-up failed" : "Sign-in failed", {
        description: msg,
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      if (oobCode) {
        await confirmNewPassword(oobCode, password);
        await api.resetPassword({ email, password, confirmPassword }).catch(() => {});
        toast.success("Password updated. Signing you in…");
        const profile = await signInWithEmail(email, password);
        await refresh();
        finishLogin(profile, "Password updated");
        return;
      }

      const result = await api.resetPassword({ email, password, confirmPassword });

      try {
        const profile = await signInWithEmail(email, password);
        await refresh();
        finishLogin(profile, "New password created");
        return;
      } catch {
        if (!result.firebaseUpdated) {
          await sendPasswordReset(email);
          setResetEmailSent(true);
          toast.success("New password saved. We also sent a confirmation link to your email.");
        } else {
          toast.success("Password updated. Please sign in with your new password.");
          setMode("signin");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err: unknown) {
      const msg = friendlyAuthError(err);
      setError(msg);
      toast.error("Could not update password", { description: msg });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const title =
    mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Create a new password";
  const subtitle =
    mode === "signin"
      ? "Sign in to write reviews, save tools, and manage your profile."
      : mode === "signup"
        ? "Join Vault of Tools with your email or Google account."
        : oobCode
          ? "Choose a strong password for your account."
          : "Enter your email and set a new password to regain access.";

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12),_transparent_55%)]" />
      <div className="relative mx-auto grid min-h-[100dvh] w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:py-12">
        <div className="hidden lg:block">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
            Vault<span className="text-foreground"> of Tools</span>
          </Link>
          <h2 className="mt-8 max-w-md text-4xl font-bold tracking-tight text-foreground">
            Discover, compare, and save the best AI tools.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Reset your password in a few seconds, then pick up where you left off — reviews, saved tools, and submissions stay with your account.
          </p>
          <div className="mt-8 flex max-w-md items-start gap-3 rounded-2xl border border-border bg-card/80 p-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Secure account recovery</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Create a new password here. Use at least 8 characters with a mix of letters and numbers.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-6 block text-center text-2xl font-bold tracking-tight text-primary lg:hidden">
            Vault<span className="text-foreground"> of Tools</span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setConfirmPassword("");
                  setResetEmailSent(false);
                }}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
            )}

            <div className="flex items-start gap-3">
              {mode === "forgot" && (
                <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Lock size={18} />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            {mode !== "forgot" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={busy}
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  <GoogleIcon /> Continue with Google
                </button>
                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> OR{" "}
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            {mode === "forgot" ? (
              <form onSubmit={handleForgot} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Email</span>
                  <div className="relative mt-1.5">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                      placeholder="you@example.com"
                    />
                  </div>
                </label>

                <PasswordField
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />

                {password && (
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            score > i + 1
                              ? "bg-emerald-500"
                              : score > i
                                ? "bg-amber-400"
                                : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {score <= 2 ? "Weak" : score <= 3 ? "Good" : "Strong"} password
                    </p>
                  </div>
                )}

                <PasswordField
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />

                {resetEmailSent && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Password saved. If Firebase still has the old password, check your inbox for a reset link.
                  </p>
                )}

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy ? "Updating password…" : "Create new password"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmail} className="space-y-4">
                {mode === "signup" && (
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Name</span>
                    <input
                      type="text"
                      autoComplete="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  />
                </label>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    minLength={mode === "signup" ? 8 : 6}
                  />
                  {mode === "signin" && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError(null);
                          setPassword("");
                          setConfirmPassword("");
                          setResetEmailSent(false);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-1 py-1 text-sm font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>

                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setPassword("");
                      setConfirmPassword("");
                      setResetEmailSent(false);
                    }}
                    className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                  >
                    Forgot password? Create a new one
                  </button>
                )}
              </form>
            )}

            {mode !== "forgot" && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setError(null);
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95L3.97 7.28C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

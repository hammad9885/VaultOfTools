"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Wrench,
  Users,
  LineChart,
  Database,
  Settings,
  Activity,
} from "lucide-react";
import { api } from "../../../lib/api";
import {
  completeGoogleRedirectIfAny,
  signInWithGoogle,
  signOut as firebaseSignOut,
} from "../../../lib/auth";
import { Button, Input } from "../../../components/admin/ui";

const FEATURES = [
  { icon: LineChart, title: "Analytics overview", desc: "Track tools, reviews and growth at a glance" },
  { icon: Wrench, title: "Tool management", desc: "Create, edit and moderate the full catalog" },
  { icon: Users, title: "User & review control", desc: "Manage accounts, roles and community content" },
  { icon: Database, title: "Data & backup", desc: "CSV import/export and full database backups" },
  { icon: Settings, title: "Settings & SEO", desc: "Site branding, analytics and content settings" },
  { icon: Activity, title: "Activity logs", desc: "Every admin action is tracked and auditable" },
];

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginInner />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await completeGoogleRedirectIfAny();
        if (cancelled || !profile) return;
        if (profile.role === "super_admin" && api.getAdminToken()) {
          router.push(callbackUrl);
          router.refresh();
          return;
        }
        api.clearAdminToken();
        await firebaseSignOut();
        setError("Only the configured admin Google account can access this console.");
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Google sign-in failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [callbackUrl, router]);

  const finishAdminGoogle = async (profile: any) => {
    if (profile?.role === "super_admin" && api.getAdminToken()) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }
    api.clearAdminToken();
    await firebaseSignOut();
    throw new Error("Only the configured admin Google account can access this console.");
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleBusy(true);
    try {
      api.clearToken();
      const profile = await signInWithGoogle();
      if (!profile) return;
      await finishAdminGoogle(profile);
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      api.clearToken();
      const res = await api.adminLogin({ email, password });
      api.setAdminToken(res.token);
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      api.clearAdminToken();
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-violet-950 p-10 text-violet-50 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.25),transparent_55%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Vault of Tools</p>
            <p className="text-xs text-violet-300">Admin Console</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            <ShieldCheck size={12} /> Super Admin only
          </p>
          <h1 className="mt-5 text-3xl font-bold leading-tight">
            Manage your entire
            <br />
            tool directory from here.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-violet-300">
            Sign in with the admin Google account or the configured admin email/password.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <Icon size={16} className="text-violet-300" />
                <p className="mt-2 text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-violet-300/80">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-violet-400">
          All admin actions are logged and auditable.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-foreground">Vault of Tools</p>
              <p className="text-xs text-muted-foreground">Admin Console</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Admin Sign In</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use Google (admin Gmail) or email/password.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || googleBusy}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            {googleBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="mb-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR{" "}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@email.com"
                  required
                  disabled={loading || googleBusy}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  disabled={loading || googleBusy}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || googleBusy}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Public users sign in at{" "}
            <a href="/login" className="text-primary hover:underline">
              /login
            </a>
            {" · "}
            <a href="/" className="text-primary hover:underline">
              Back to site
            </a>
          </p>
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

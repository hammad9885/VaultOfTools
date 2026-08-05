"use client";

import { Suspense, useState } from "react";
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
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.user?.role === "super_admin") {
        api.setToken(res.token);
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("Super admin access required");
        api.clearToken();
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Left brand panel */}
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
            Approve submissions, moderate reviews, manage users and keep your
            catalog accurate — all in one protected console.
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

      {/* Right form panel */}
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
              Restricted access — super admin credentials required.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

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
                  placeholder="admin@vaultoftools.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <a href="/auth" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
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
                  disabled={loading}
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

            <Button type="submit" className="w-full" disabled={loading}>
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <a href="/" className="text-primary hover:underline">← Back to site</a>
          </p>
        </div>
      </div>
    </div>
  );
}

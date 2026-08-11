"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ChevronRight, LogOut, User as UserIcon, ExternalLink } from "lucide-react";
import { AdminThemeProvider } from "./theme";
import { ThemeToggle } from "./ThemeToggle";
import { Sidebar } from "./Sidebar";
import { api } from "../../lib/api";
import { Button } from "./ui";

const BREADCRUMBS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/tools": "AI Tools",
  "/admin/categories": "Categories",
  "/admin/tags": "Tags",
  "/admin/reviews": "Reviews & Comments",
  "/admin/posts": "Blog Posts",
  "/admin/submissions": "Submissions",
  "/admin/users": "Users & Permissions",
  "/admin/subscribers": "Subscribers",
  "/admin/consultations": "Consultations",
  "/admin/settings": "Settings & SEO",
  "/admin/data": "Data & Backup",
  "/admin/activity": "Activity Logs",
};

function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs: { label: string; href?: string }[] = [{ label: "Admin", href: "/admin" }];
  if (pathname !== "/admin") {
    crumbs.push({ label: BREADCRUMBS[pathname] || pathname.split("/").pop() || "Page" });
  }
  return (
    <nav className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} />}
          {crumb.href ? (
            <a href={crumb.href} className="transition hover:text-foreground">{crumb.label}</a>
          ) : (
            <span className="font-medium text-foreground">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = api.getAdminToken();
      if (!token) {
        if (!cancelled) router.replace("/admin/login");
        return;
      }
      try {
        const res = await api.adminMe();
        if (!cancelled) {
          setAdminUser(res.user);
          setChecking(false);
        }
      } catch {
        api.clearAdminToken();
        if (!cancelled) router.replace("/admin/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const displayName = useMemo(
    () => adminUser?.displayName || adminUser?.email?.split("@")[0] || "Admin",
    [adminUser]
  );

  if (checking) {
    return (
      <AdminThemeProvider>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      </AdminThemeProvider>
    );
  }

  return (
    <AdminThemeProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-muted lg:hidden"
            >
              <Menu size={16} />
            </button>

            <Breadcrumbs pathname={pathname} />

            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Quick search (Ctrl+K)"
                  className="h-9 w-56 rounded-lg border border-border bg-card pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary/50"
                />
              </div>

              <ThemeToggle />

              <div className="flex items-center gap-2 rounded-lg border border-border bg-card py-1.5 pl-1.5 pr-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <UserIcon size={13} />
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="text-xs font-semibold text-foreground">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground">Super Admin</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                aria-label="View public site"
                onClick={() => window.open("/", "_blank")}
              >
                <ExternalLink size={15} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={() => {
                  api.clearAdminToken();
                  router.replace("/admin/login");
                }}
              >
                <LogOut size={15} />
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

          <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
            Vault of Tools Admin — MongoDB super admin only. All actions are logged.
          </footer>
        </div>
      </div>
    </AdminThemeProvider>
  );
}

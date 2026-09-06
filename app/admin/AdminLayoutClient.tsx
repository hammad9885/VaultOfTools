"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";

// Lazy-load the admin shell so the public site never pays for admin JS.
const Shell = dynamic(() => import("../components/admin/AdminShell").then((m) => m.AdminShell), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  ),
});

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAuthRoute = pathname.startsWith("/admin/login");

  const meta = useMemo(() => {
    if (pathname === "/admin") return { title: "Dashboard" };
    const key = pathname.split("/")[2] || "admin";
    const map: Record<string, string> = {
      tools: "AI Tools",
      categories: "Categories",
      tags: "Tags",
      reviews: "Reviews & Comments",
      posts: "Blog Posts",
      submissions: "Submissions",
      users: "Users & Permissions",
      subscribers: "Subscribers",
      consultations: "Consultations",
      settings: "Settings & SEO",
      data: "Data & Backup",
      activity: "Activity Logs",
      login: "Sign In",
    };
    return { title: map[key] || "Admin" };
  }, [pathname]);

  useEffect(() => {
    document.title = `${meta.title} | Vault Admin`;
  }, [meta.title]);

  if (isAuthRoute) {
    return (
      <>
        <Toaster position="top-right" richColors />
        {children}
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {mounted ? (
        <Shell>{children}</Shell>
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}
    </>
  );
}

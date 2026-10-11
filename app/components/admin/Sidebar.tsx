"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import {
  Activity,
  BarChart3,
  Boxes,
  Database,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  Wrench,
  X,
} from "lucide-react";

const GROUPS: { label: string; items: { href: string; label: string; icon: any }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/tools", label: "Tools", icon: Wrench },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/tags", label: "Tags", icon: Tags },
      { href: "/admin/reviews", label: "Reviews & Comments", icon: MessageSquare },
      { href: "/admin/posts", label: "Blog Posts", icon: Newspaper },
      { href: "/admin/submissions", label: "Submissions", icon: Inbox },
    ],
  },
  {
    label: "Audience",
    items: [
      { href: "/admin/users", label: "Users & Permissions", icon: Users },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
      { href: "/admin/consultations", label: "Consultations", icon: Boxes },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings & SEO", icon: Settings },
      { href: "/admin/data", label: "Data & Backup", icon: Database },
      { href: "/admin/activity", label: "Activity Logs", icon: Activity },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck size={16} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">Vault Admin</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Super Admin</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <BarChart3 size={16} />
            View Public Site
          </Link>
        </div>
      </aside>
    </>
  );
}

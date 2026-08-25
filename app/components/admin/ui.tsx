"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4 text-sm",
        size === "icon" && "h-9 w-9",
        variant === "default" && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        variant === "outline" && "border border-border bg-card text-foreground hover:bg-muted",
        variant === "ghost" && "text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  tone = "default",
  className,
  children,
}: {
  tone?: "default" | "success" | "warning" | "danger" | "info" | "violet";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tone === "default" && "bg-muted text-muted-foreground",
        tone === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
        tone === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
        tone === "danger" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
        tone === "info" && "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
        tone === "violet" && "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: "success" | "warning" | "danger" | "info" | "violet" | "default"; label: string }> = {
    published: { tone: "success", label: "Published" },
    approved: { tone: "success", label: "Approved" },
    subscribed: { tone: "success", label: "Subscribed" },
    active: { tone: "success", label: "Active" },
    draft: { tone: "default", label: "Draft" },
    pending: { tone: "warning", label: "Pending" },
    rejected: { tone: "danger", label: "Rejected" },
    suspended: { tone: "danger", label: "Suspended" },
    archived: { tone: "default", label: "Archived" },
    unsubscribed: { tone: "default", label: "Unsubscribed" },
    new: { tone: "info", label: "New" },
    contacted: { tone: "info", label: "Contacted" },
    qualified: { tone: "violet", label: "Qualified" },
    closed: { tone: "default", label: "Closed" },
    super_admin: { tone: "violet", label: "Super Admin" },
    admin: { tone: "violet", label: "Admin" },
    moderator: { tone: "info", label: "Moderator" },
    featured: { tone: "violet", label: "Featured" },
  };
  const entry = map[status] || { tone: "default" as const, label: status };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5",
        props.className
      )}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-4 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

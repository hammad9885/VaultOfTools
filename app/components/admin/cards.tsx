"use client";

import { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "default",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  accent?: "default" | "violet" | "emerald" | "amber" | "sky" | "rose";
}) {
  const accentMap: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm min-w-0 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</p>
          <p className="mt-1.5 truncate text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">{value}</p>
          {hint && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground sm:text-xs">{hint}</p>}
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", accentMap[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function Card({ title, description, actions, children, className }: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

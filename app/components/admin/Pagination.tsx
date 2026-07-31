"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function Pagination({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total?: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1 && total === undefined) return null;

  const nums: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row">
      {total !== undefined && (
        <p className="text-xs text-muted-foreground">
          {total} result{total === 1 ? "" : "s"}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        {start > 1 && (
          <>
            <button type="button" onClick={() => onChange(1)} className="h-8 w-8 rounded-lg text-xs text-muted-foreground hover:bg-muted">
              1
            </button>
            {start > 2 && <span className="px-1 text-xs text-muted-foreground">…</span>}
          </>
        )}
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-8 w-8 rounded-lg text-xs font-medium transition",
              n === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {n}
          </button>
        ))}
        {end < pages && (
          <>
            {end < pages - 1 && <span className="px-1 text-xs text-muted-foreground">…</span>}
            <button type="button" onClick={() => onChange(pages)} className="h-8 w-8 rounded-lg text-xs text-muted-foreground hover:bg-muted">
              {pages}
            </button>
          </>
        )}
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

"use client";

import { ReactNode } from "react";
import { EmptyState } from "./ui";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  loading,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  rowActions,
  dense,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  rowActions?: (row: T) => ReactNode;
  dense?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain">
      <table className="min-w-[640px] w-full text-left">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-5 ${col.className || ""} ${col.hideOnMobile ? "hidden lg:table-cell" : ""}`}
              >
                {col.header}
              </th>
            ))}
            {rowActions && <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-5">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row._id} className="transition hover:bg-muted/40">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 sm:px-5 ${dense ? "py-2.5" : "py-3.5"} text-sm text-foreground ${col.className || ""} ${col.hideOnMobile ? "hidden lg:table-cell" : ""}`}
                >
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              {rowActions && (
                <td className={`px-3 text-right sm:px-5 ${dense ? "py-2.5" : "py-3.5"}`}>
                  <div className="flex items-center justify-end gap-1">{rowActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

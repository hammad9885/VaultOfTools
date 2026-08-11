"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ActivityRow } from "../../lib/admin/types";
import { adminApi } from "../../lib/admin/api";
import { PageHeader, Card } from "../../components/admin/cards";
import { Pagination } from "../../components/admin/Pagination";
import { Badge } from "../../components/admin/ui";

function actionTone(action: string): "success" | "danger" | "info" | "warning" | "default" {
  if (action === "created" || action === "approved") return "success";
  if (action === "deleted" || action === "rejected") return "danger";
  if (action === "updated") return "info";
  if (action === "imported") return "warning";
  return "default";
}

export default function AdminActivityPage() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getActivity({ page, limit: 20 });
      setRows(res.items as ActivityRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description={`${total} admin actions recorded — every change is traceable`}
      />

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No activity recorded yet. Admin actions will appear here.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((a) => (
              <li key={a._id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/50" />
                  <div className="min-w-0">
                    <p className="line-clamp-2 break-words text-sm text-foreground">
                      <span className="font-medium">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </p>
                    {a.meta && Object.keys(a.meta).length > 0 && (
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        {JSON.stringify(a.meta)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-5 flex shrink-0 flex-row flex-wrap items-center gap-2 sm:ml-0 sm:flex-col sm:items-end sm:gap-1.5">
                  <Badge tone={actionTone(a.action)}>{a.action}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pages={pages} total={total} onChange={setPage} />
      </Card>
    </div>
  );
}

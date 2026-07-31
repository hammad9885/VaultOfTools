"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { ReviewRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Button, Input, Select } from "../../components/admin/ui";

export default function AdminReviewsPage() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReviews({
        search: search || undefined,
        status: status || undefined,
        rating: rating || undefined,
        page,
        limit: 15,
      });
      setRows(res.items as ReviewRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [search, status, rating, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (r: ReviewRow, newStatus: string) => {
    try {
      await adminApi.updateReview(r._id, { status: newStatus });
      toast.success(`Review ${newStatus}`);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const remove = async (r: ReviewRow) => {
    if (!confirm("Delete this review?")) return;
    setDeleting(r._id);
    try {
      await adminApi.deleteReview(r._id);
      toast.success("Review deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<ReviewRow>[] = [
    {
      key: "review",
      header: "Review",
      render: (r) => (
        <div className="min-w-0 max-w-md">
          <p className="truncate font-medium text-foreground">{r.toolName}</p>
          <p className="truncate text-xs text-muted-foreground">“{r.text}”</p>
        </div>
      ),
    },
    {
      key: "author",
      header: "By",
      render: (r) => <span className="text-muted-foreground">{r.userName || "Anonymous"}</span>,
      hideOnMobile: true,
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => <span className="font-medium text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Select
          className="h-8 w-32 text-xs"
          value={r.status}
          onChange={(e) => updateStatus(r, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (r) => <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader title="Reviews & Comments" description={`${total} reviews — approve, reject or moderate`} />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <Input placeholder="Search by tool, author or content…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Button type="submit">Search</Button>
        </form>
        <div className="flex gap-2">
          <Select className="w-36" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Any status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Select className="w-28" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
            <option value="">Any rating</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} stars</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No reviews found"
          emptyDescription="Reviews from the community appear here."
          rowActions={(r) => (
            <Button variant="ghost" size="icon" disabled={deleting === r._id} onClick={() => remove(r)}>
              <Trash2 size={14} className="text-destructive" />
            </Button>
          )}
        />
        <Pagination page={page} pages={pages} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

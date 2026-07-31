"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { SubmissionRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Button, Input, Select, StatusBadge } from "../../components/admin/ui";

export default function AdminSubmissionsPage() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSubmissions({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 15,
      });
      setRows(res.items as SubmissionRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (s: SubmissionRow, newStatus: string) => {
    try {
      await adminApi.updateSubmission(s._id, { status: newStatus });
      toast.success(newStatus === "approved" ? "Approved — published to catalog" : `Submission ${newStatus}`);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const remove = async (s: SubmissionRow) => {
    if (!confirm(`Delete submission "${s.name}"?`)) return;
    setDeleting(s._id);
    try {
      await adminApi.deleteSubmission(s._id);
      toast.success("Submission deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<SubmissionRow>[] = [
    {
      key: "name",
      header: "Tool",
      render: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{s.name}</p>
          <a href={s.website} target="_blank" rel="noreferrer" className="truncate text-xs text-primary hover:underline">
            {s.website}
          </a>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (s) => <span className="text-muted-foreground">{s.category}</span>, hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "createdAt",
      header: "Submitted",
      render: (s) => <span className="text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader title="Tool Submissions" description={`${total} community submissions — approving publishes the tool to the catalog`} />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <Input placeholder="Search submissions…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Button type="submit">Search</Button>
        </form>
        <Select className="w-36" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Any status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No submissions found"
          emptyDescription="Community tool submissions land here."
          rowActions={(s) => (
            <>
              {s.status === "pending" && (
                <>
                  <Button variant="success" size="sm" onClick={() => updateStatus(s, "approved")}>
                    <Check size={13} /> Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => updateStatus(s, "rejected")}>
                    <X size={13} /> Reject
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" disabled={deleting === s._id} onClick={() => remove(s)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </>
          )}
        />
        <Pagination page={page} pages={pages} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { ConsultationRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Button, Input, Select } from "../../components/admin/ui";

export default function AdminConsultationsPage() {
  const [rows, setRows] = useState<ConsultationRow[]>([]);
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
      const res = await adminApi.getConsultations({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 15,
      });
      setRows(res.items as ConsultationRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (c: ConsultationRow, newStatus: string) => {
    try {
      await adminApi.updateConsultation(c._id, { status: newStatus });
      toast.success("Consultation updated");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const remove = async (c: ConsultationRow) => {
    if (!confirm("Delete this consultation request?")) return;
    setDeleting(c._id);
    try {
      await adminApi.deleteConsultation(c._id);
      toast.success("Consultation deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<ConsultationRow>[] = [
    {
      key: "request",
      header: "Request",
      render: (c) => (
        <div className="min-w-0 max-w-md">
          <p className="truncate font-medium text-foreground">{c.name}</p>
          <p className="truncate text-xs text-muted-foreground">{c.message}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (c) => (
        <div className="min-w-0">
          <a href={`mailto:${c.email}`} className="block truncate text-xs text-primary hover:underline">{c.email}</a>
          {c.company && <p className="truncate text-xs text-muted-foreground">{c.company}</p>}
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Select className="h-8 w-32 text-xs" value={c.status} onChange={(e) => updateStatus(c, e.target.value)}>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
        </Select>
      ),
    },
    {
      key: "createdAt",
      header: "Received",
      render: (c) => <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader title="Consultation Requests" description={`${total} requests — track from new to closed`} />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <Input placeholder="Search by name, email or company…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Button type="submit">Search</Button>
        </form>
        <Select className="w-36" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Any status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No consultation requests"
          emptyDescription="Requests from the consulting page appear here."
          rowActions={(c) => (
            <Button variant="ghost" size="icon" disabled={deleting === c._id} onClick={() => remove(c)}>
              <Trash2 size={14} className="text-destructive" />
            </Button>
          )}
        />
        <Pagination page={page} pages={pages} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

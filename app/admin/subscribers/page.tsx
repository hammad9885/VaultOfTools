"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { SubscriberRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Button, Field, Input, Modal, Select, StatusBadge } from "../../components/admin/ui";

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSubscribers({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 20,
      });
      setRows(res.items as SubscriberRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!email.trim()) return;
    setSaving(true);
    try {
      await adminApi.createSubscriber(email.trim());
      toast.success("Subscriber added");
      setEmail("");
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add subscriber");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s: SubscriberRow) => {
    const next = s.status === "subscribed" ? "unsubscribed" : "subscribed";
    try {
      await adminApi.updateSubscriber(s._id, { status: next });
      toast.success(`Subscriber ${next}`);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const remove = async (s: SubscriberRow) => {
    if (!confirm(`Remove ${s.email} from the list?`)) return;
    setDeleting(s._id);
    try {
      await adminApi.deleteSubscriber(s._id);
      toast.success("Subscriber removed");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<SubscriberRow>[] = [
    {
      key: "email",
      header: "Email",
      render: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{s.email}</p>
          {s.name && <p className="truncate text-xs text-muted-foreground">{s.name}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "createdAt",
      header: "Subscribed",
      render: (s) => <span className="text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Newsletter Subscribers"
        description={`${total} subscribers on the newsletter list`}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add Subscriber
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <Input placeholder="Search by email…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Button type="submit">Search</Button>
        </form>
        <Select className="w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Any status</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No subscribers yet"
          emptyDescription="Newsletter signups from the site appear here."
          rowActions={(s) => (
            <>
              <Button variant="outline" size="sm" onClick={() => toggle(s)}>
                {s.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
              </Button>
              <Button variant="ghost" size="icon" disabled={deleting === s._id} onClick={() => remove(s)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </>
          )}
        />
        <Pagination page={page} pages={pages} total={total} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add subscriber"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={add} disabled={saving || !email.trim()}>{saving ? "Adding…" : "Add"}</Button>
          </>
        }
      >
        <Field label="Email *">
          <Input type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}

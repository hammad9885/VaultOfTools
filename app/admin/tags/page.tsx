"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { TagRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Button, Field, Input, Modal } from "../../components/admin/ui";
import { slugify } from "../../lib/admin/utils";

const EMPTY = { name: "", slug: "" };

export default function AdminTagsPage() {
  const [rows, setRows] = useState<TagRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TagRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTags({ search: search || undefined, page, limit: 20 });
      setRows(res.items as TagRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setModalOpen(true);
  };

  const openEdit = (t: TagRow) => {
    setEditing(t);
    setForm({ name: t.name, slug: t.slug });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug.trim() || slugify(form.name) };
      if (editing) {
        await adminApi.updateTag(editing._id, payload);
        toast.success("Tag updated");
      } else {
        await adminApi.createTag(payload);
        toast.success("Tag created");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: TagRow) => {
    if (!confirm(`Delete tag "${t.name}"?`)) return;
    setDeleting(t._id);
    try {
      await adminApi.deleteTag(t._id);
      toast.success("Tag deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<TagRow>[] = [
    { key: "name", header: "Tag", render: (t) => <span className="font-medium text-foreground">{t.name}</span> },
    { key: "slug", header: "Slug", render: (t) => <span className="text-muted-foreground">/{t.slug}</span>, hideOnMobile: true },
    {
      key: "toolCount",
      header: "Tools using it",
      render: (t) => <span className="font-medium">{(t as any).toolCount ?? 0}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tags"
        description={`${total} tags`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> New Tag
          </Button>
        }
      />

      <form
        className="mb-4 flex gap-2 rounded-xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
          setPage(1);
        }}
      >
        <Input placeholder="Search tags…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <Button type="submit">Search</Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No tags found"
          emptyDescription="Tags help users discover related tools."
          rowActions={(t) => (
            <>
              <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="icon" disabled={deleting === t._id} onClick={() => remove(t)}>
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
        title={editing ? `Edit ${editing.name}` : "New tag"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Slug" hint="Auto-generated if empty">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

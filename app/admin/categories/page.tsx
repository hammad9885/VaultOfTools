"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { CategoryRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Button, Field, Input, Modal, Textarea } from "../../components/admin/ui";
import { slugify } from "../../lib/admin/utils";

const EMPTY = { name: "", slug: "", icon: "", description: "" };

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories({ search: search || undefined, page, limit: 15 });
      setRows(res.items as CategoryRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load categories");
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

  const openEdit = (c: CategoryRow) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, icon: c.icon || "", description: c.description || "" });
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
        await adminApi.updateCategory(editing._id, payload);
        toast.success("Category updated");
      } else {
        await adminApi.createCategory(payload);
        toast.success("Category created");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: CategoryRow) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    setDeleting(c._id);
    try {
      await adminApi.deleteCategory(c._id);
      toast.success("Category deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<CategoryRow>[] = [
    {
      key: "name",
      header: "Category",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {c.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.icon} alt="" className="h-5 w-5 object-contain" />
            ) : (
              <span className="text-xs font-bold">{c.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{c.name}</p>
            <p className="text-xs text-muted-foreground">/{c.slug}</p>
          </div>
        </div>
      ),
    },
    { key: "description", header: "Description", render: (c) => <span className="text-muted-foreground">{c.description || "—"}</span>, hideOnMobile: true },
    {
      key: "toolCount",
      header: "Tools",
      render: (c) => <span className="font-medium">{(c as any).toolCount ?? 0}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        description={`${total} categories`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> New Category
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
        <Input placeholder="Search categories…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <Button type="submit">Search</Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No categories found"
          emptyDescription="Categories organize your tool catalog."
          rowActions={(c) => (
            <>
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="icon" disabled={deleting === c._id} onClick={() => remove(c)}>
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
        title={editing ? `Edit ${editing.name}` : "New category"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Slug" hint="Auto-generated if empty">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
          </div>
          <Field label="Icon URL" hint="Optional image or icon URL">
            <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

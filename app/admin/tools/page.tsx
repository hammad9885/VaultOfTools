"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { ToolRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Badge, Button, Field, Input, Modal, Select, StatusBadge, Textarea } from "../../components/admin/ui";
import { slugify } from "../../lib/admin/utils";
import { ToolLogo } from "../../components/ToolLogo";

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "",
  website: "",
  url: "",
  shortDescription: "",
  description: "",
  pricing: "Free",
  features: "",
  tags: "",
  featured: false,
  sponsored: false,
  status: "published",
};

export default function AdminToolsPage() {
  const [rows, setRows] = useState<ToolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [sponsored, setSponsored] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ToolRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTools({
        search: search || undefined,
        status: status || undefined,
        featured: featured || undefined,
        sponsored: sponsored || undefined,
        page,
        limit: 10,
      });
      setRows(res.items as ToolRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load tools");
    } finally {
      setLoading(false);
    }
  }, [search, status, featured, sponsored, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (tool: ToolRow) => {
    setEditing(tool);
    setForm({
      name: tool.name,
      slug: tool.slug,
      category: tool.category,
      website: tool.website || tool.url || "",
      url: tool.url || "",
      shortDescription: tool.shortDescription || "",
      description: tool.description || "",
      pricing: tool.pricing,
      features: (tool.features || []).join(", "),
      tags: (tool.tags || []).join(", "),
      featured: tool.featured,
      sponsored: tool.sponsored,
      status: tool.status,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || slugify(form.name),
        features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editing) {
        await adminApi.updateTool(editing._id, payload);
        toast.success("Tool updated");
      } else {
        await adminApi.createTool(payload);
        toast.success("Tool created");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleFlag = async (tool: ToolRow, key: "featured" | "sponsored") => {
    try {
      await adminApi.updateTool(tool._id, { [key]: !tool[key] });
      toast.success(`${tool.name} ${key === "featured" ? "featured" : "sponsored"} toggled`);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const remove = async (tool: ToolRow) => {
    if (!confirm(`Delete "${tool.name}"? This cannot be undone.`)) return;
    setDeleting(tool._id);
    try {
      await adminApi.deleteTool(tool._id);
      toast.success("Tool deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<ToolRow>[] = [
    {
      key: "name",
      header: "Tool",
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            <ToolLogo name={t.name} logo={t.logo} website={t.website || t.url} size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{t.name}</p>
            <p className="truncate text-xs text-muted-foreground">/{t.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (t) => <span className="text-muted-foreground">{t.category}</span>,
      hideOnMobile: true,
    },
    {
      key: "pricing",
      header: "Pricing",
      render: (t) => <Badge tone={t.pricing === "Free" ? "success" : "default"}>{t.pricing}</Badge>,
      hideOnMobile: true,
    },
    {
      key: "rating",
      header: "Rating",
      render: (t) => (
        <span className="text-sm">
          ★ <span className="font-medium">{t.rating || "—"}</span>
          {t.reviews > 0 && <span className="text-xs text-muted-foreground"> ({t.reviews})</span>}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "flags",
      header: "Flags",
      render: (t) => (
        <div className="flex flex-wrap gap-1">
          {t.featured && <Badge tone="violet">Featured</Badge>}
          {t.sponsored && <Badge tone="info">Sponsored</Badge>}
          <StatusBadge status={t.status} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="AI Tools"
        description={`${total} tools in the catalog`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus size={14} /> New Tool
            </Button>
          </>
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
          <Input
            placeholder="Search by name, slug or category…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" size="md">Search</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Select
            className="w-32"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
          <Select
            className="w-32"
            value={featured}
            onChange={(e) => {
              setFeatured(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any featured</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </Select>
          <Select
            className="w-32"
            value={sponsored}
            onChange={(e) => {
              setSponsored(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any sponsored</option>
            <option value="true">Sponsored</option>
            <option value="false">Not sponsored</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No tools found"
          emptyDescription="Try adjusting the filters, or create your first tool."
          rowActions={(t) => (
            <>
              <Button variant="ghost" size="icon" aria-label="Toggle featured" onClick={() => toggleFlag(t, "featured")}>
                <Star size={14} className={t.featured ? "fill-amber-400 text-amber-400" : ""} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(t)}>
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete" disabled={deleting === t._id} onClick={() => remove(t)}>
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
        title={editing ? `Edit ${editing.name}` : "Create new tool"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save tool"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Slug" hint="Auto-generated from name if empty">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category *">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
            <Field label="Pricing">
              <Select value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value })}>
                <option>Free</option>
                <option>Freemium</option>
                <option>Paid</option>
                <option>subscription</option>
              </Select>
            </Field>
          </div>
          <Field label="Website URL">
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </Field>
          <Field label="Short description">
            <Textarea rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </Field>
          <Field label="Full description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Features" hint="Comma separated">
              <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.sponsored} onChange={(e) => setForm({ ...form, sponsored: e.target.checked })} />
              Sponsored
            </label>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

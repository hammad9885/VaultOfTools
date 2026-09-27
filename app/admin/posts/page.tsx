"use client";

import { useCallback, useEffect, useState } from "react";
import { toast, confirmAction } from "../../lib/admin/notify";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { adminApi } from "../../lib/admin/api";
import { PostRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Badge, Button, Field, Input, Modal } from "../../components/admin/ui";
import { slugify } from "../../lib/admin/utils";

const EMPTY = { title: "", slug: "", category: "General", excerpt: "", featured: false };

export default function AdminPostsPage() {
  const [rows, setRows] = useState<PostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPosts({ search: search || undefined, page, limit: 15 });
      setRows(res.items as PostRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load posts");
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

  const openEdit = (p: PostRow) => {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, category: p.category, excerpt: (p as any).excerpt || "", featured: p.featured });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug.trim() || slugify(form.title) };
      if (editing) {
        await adminApi.updatePost(editing._id, payload);
        toast.success("Post updated");
      } else {
        await adminApi.createPost(payload);
        toast.success("Post created");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (p: PostRow) => {
    try {
      await adminApi.updatePost(p._id, { featured: !p.featured });
      toast.success("Post updated");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const remove = async (p: PostRow) => {
    const confirmed = await confirmAction(`Delete post "${p.title}"?`);
    if (!confirmed) return;
    setDeleting(p._id);
    try {
      await adminApi.deletePost(p._id);
      toast.success("Post deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<PostRow>[] = [
    {
      key: "title",
      header: "Post",
      render: (p) => (
        <div className="min-w-0 max-w-md">
          <Link href={`/blog/${p.slug}`} className="block truncate font-medium text-foreground hover:text-primary">
            {p.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (p) => <Badge>{p.category}</Badge>, hideOnMobile: true },
    {
      key: "featured",
      header: "Featured",
      render: (p) => (p.featured ? <Badge tone="violet">Featured</Badge> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (p) => <span className="text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        description={`${total} posts`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> New Post
          </Button>
        }
      />

      <form
        className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-card p-4 min-[420px]:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
          setPage(1);
        }}
      >
        <Input placeholder="Search posts…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <Button type="submit">Search</Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No posts found"
          emptyDescription="Create your first blog post to start publishing."
          rowActions={(p) => (
            <>
              <Button variant="outline" size="sm" onClick={() => toggleFeatured(p)}>
                {p.featured ? "Unfeature" : "Feature"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" disabled={deleting === p._id} onClick={() => remove(p)}>
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
        title={editing ? `Edit ${editing.title}` : "New blog post"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title *">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Slug" hint="Auto-generated if empty">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
          </div>
          <Field label="Excerpt">
            <textarea
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Feature on the blog homepage
          </label>
        </div>
      </Modal>
    </div>
  );
}

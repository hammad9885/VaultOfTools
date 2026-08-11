"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { UserRow } from "../../lib/admin/types";
import { PageHeader } from "../../components/admin/cards";
import { DataTable, Column } from "../../components/admin/DataTable";
import { Pagination } from "../../components/admin/Pagination";
import { Button, Input, Select, Field, Modal, Spinner } from "../../components/admin/ui";

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "user",
    status: "active",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: 15,
      });
      setRows(res.items as UserRow[]);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (u: UserRow, patch: any) => {
    try {
      await adminApi.updateUser(u._id, patch);
      toast.success("User updated");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createUser(form);
      toast.success("User created");
      setShowAdd(false);
      setForm({ email: "", password: "", displayName: "", role: "user", status: "active" });
      setPage(1);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: UserRow) => {
    if (!confirm(`Delete user "${u.email}" and their reviews/submissions?`)) return;
    setDeleting(u._id);
    try {
      await adminApi.deleteUser(u._id);
      toast.success("User deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<UserRow>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {(u.displayName || u.email).slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{u.displayName || "—"}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Select
          className="h-8 w-36 text-xs"
          value={u.role}
          onChange={(e) => update(u, { role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </Select>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Select
          className="h-8 w-32 text-xs"
          value={u.status}
          onChange={(e) => update(u, { status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u) => <span className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>,
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users & Permissions"
        description={`${total} registered users — roles and moderation controls`}
        actions={
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={15} className="mr-1.5" />
            Add User
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form
          className="flex min-w-0 flex-1 flex-col gap-2 min-[420px]:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
        >
          <Input placeholder="Search by email or name…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Button type="submit">Search</Button>
        </form>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex">
          <Select className="w-full sm:w-36" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </Select>
          <Select className="w-full sm:w-32" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyTitle="No users found"
          emptyDescription="Users appear here once they register."
          rowActions={(u) => (
            <Button variant="ghost" size="icon" disabled={deleting === u._id} onClick={() => remove(u)}>
              <Trash2 size={14} className="text-destructive" />
            </Button>
          )}
        />
        <Pagination page={page} pages={pages} total={total} onChange={setPage} />
      </div>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add User"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} disabled={saving}>
              Cancel
            </Button>
            <Button form="add-user-form" type="submit" disabled={saving}>
              {saving ? <Spinner className="mr-1.5 h-4 w-4" /> : null}
              Create User
            </Button>
          </div>
        }
      >
        <form id="add-user-form" onSubmit={addUser} className="space-y-4">
          <Field label="Email *">
            <Input
              type="email"
              required
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Password *" hint="Minimum 8 characters">
            <Input
              type="text"
              required
              minLength={8}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <Field label="Display Name">
            <Input
              placeholder="Full name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Role">
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}

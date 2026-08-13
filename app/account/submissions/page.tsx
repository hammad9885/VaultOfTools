"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";
import { api } from "../../lib/api";
import Link from "next/link";

type Row = {
  _id: string;
  name: string;
  website: string;
  status: "pending" | "approved" | "rejected";
  category: string;
  createdAt: string;
};

function AccountSubmissionsShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 font-sans text-foreground sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your account</h1>
      <nav className="mt-6 flex gap-4 overflow-x-auto border-b border-border text-sm font-medium sm:gap-6">
        <Link
          href="/account"
          className="-mb-px shrink-0 border-b-2 border-transparent pb-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          Profile
        </Link>
        <Link
          href="/account/saved"
          className="-mb-px shrink-0 border-b-2 border-transparent pb-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          Saved tools
        </Link>
        <Link
          href="/account/submissions"
          className="-mb-px shrink-0 border-b-2 border-primary pb-3 text-primary"
        >
          My submissions
        </Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export default function MySubmissions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadSubmissions() {
      try {
        const data = await api.getMySubmissions();
        setRows(data);
      } catch (err) {
        console.error("Error loading submissions:", err);
      } finally {
        setBusy(false);
      }
    }

    loadSubmissions();
  }, [user]);

  if (loading || busy) {
    return (
      <AccountSubmissionsShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AccountSubmissionsShell>
    );
  }

  if (rows.length === 0) {
    return (
      <AccountSubmissionsShell>
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
          <p className="text-sm text-muted-foreground">
            You have not submitted any tools yet.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Submit your first tool →
          </Link>
        </div>
      </AccountSubmissionsShell>
    );
  }

  const badge = (s: Row["status"]) =>
    s === "approved"
      ? "bg-emerald-50 text-emerald-700"
      : s === "rejected"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";

  return (
    <AccountSubmissionsShell>
      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r._id}
            className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{r.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r.category} · {new Date(r.createdAt).toLocaleDateString()} ·{" "}
                <a
                  href={r.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  {r.website}
                </a>
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge(r.status)}`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </AccountSubmissionsShell>
  );
}

"use client";

import { useEffect, useState } from "react";
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

export default function MySubmissions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
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
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
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
    );
  }

  const badge = (s: Row["status"]) =>
    s === "approved"
      ? "bg-emerald-50 text-emerald-700"
      : s === "rejected"
        ? "bg-rose-50 text-rose-700"
        : "bg-amber-50 text-amber-700";

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div
          key={r._id}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <p className="font-semibold truncate">{r.name}</p>
            <p className="text-xs text-muted-foreground truncate">
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
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge(r.status)}`}
          >
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}

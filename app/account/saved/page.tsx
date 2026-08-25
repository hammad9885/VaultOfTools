"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiBookmark } from "react-icons/fi";
import { useAuth } from "../../hooks/use-auth";
import { api } from "../../lib/api";
import { useSavedTools } from "../../lib/saved-tools-context";
import { ToolLogo } from "../../components/ToolLogo";

type SavedRow = {
  slug: string;
  name: string;
  desc?: string;
  logo?: string;
  category?: string;
  savedAt?: string;
};

function AccountSavedShell({ children }: { children: ReactNode }) {
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
          className="-mb-px shrink-0 border-b-2 border-primary pb-3 text-primary"
        >
          Saved tools
        </Link>
        <Link
          href="/account/submissions"
          className="-mb-px shrink-0 border-b-2 border-transparent pb-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          My submissions
        </Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export default function SavedToolsPage() {
  const { user, loading } = useAuth();
  const { savedSlugs, toggleSave } = useSavedTools();
  const router = useRouter();
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let alive = true;

    api
      .getSavedTools()
      .then((data) => {
        if (alive) setRows(data.tools || []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setBusy(false);
      });

    return () => {
      alive = false;
    };
  }, [user]);

  if (loading || busy) {
    return (
      <AccountSavedShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AccountSavedShell>
    );
  }

  const visible = rows.filter((row) => savedSlugs.includes(row.slug));

  if (visible.length === 0) {
    return (
      <AccountSavedShell>
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
          <p className="text-sm text-muted-foreground">
            You have not saved any tools yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Browse AI tools →
          </Link>
        </div>
      </AccountSavedShell>
    );
  }

  return (
    <AccountSavedShell>
      <div className="space-y-3">
        {visible.map((row) => (
          <div
            key={row.slug}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
              <ToolLogo name={row.name} logo={row.logo || ""} website={(row as any).website} size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/tool/${row.slug}`}
                className="font-semibold hover:text-primary"
              >
                {row.name}
              </Link>
              {row.desc && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {row.desc}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void toggleSave({ slug: row.slug, name: row.name })}
              aria-label={`Remove ${row.name} from saved tools`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <FiBookmark size={13} className="fill-current" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </AccountSavedShell>
  );
}

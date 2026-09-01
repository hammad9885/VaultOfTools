"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  Eye,
  FolderTree,
  Inbox,
  Mail,
  Newspaper,
  ShieldCheck,
  Star,
  Tags,
  Users,
  Wrench,
  Bookmark,
} from "lucide-react";
import { adminApi } from "../lib/admin/api";
import { OverviewData, ToolRow } from "../lib/admin/types";
import { Card, StatCard } from "../components/admin/cards";
import { BarChart, DonutChart } from "../components/admin/charts";
import { Spinner, StatusBadge } from "../components/admin/ui";
import { ToolLogo } from "../components/ToolLogo";

function formatCount(n: number | undefined) {
  const value = Number(n || 0);
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(value);
}

function ToolListItem({
  tool,
  meta,
}: {
  tool: ToolRow;
  meta?: ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          <ToolLogo name={tool.name} logo={tool.logo} website={tool.website || tool.url} size={22} />
        </div>
        <div className="min-w-0">
          <Link
            href={`/tool/${tool.slug}`}
            className="block truncate text-sm font-medium text-foreground hover:text-primary"
          >
            {tool.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{tool.category}</p>
        </div>
      </div>
      {meta ?? <StatusBadge status={tool.status} />}
    </li>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminApi
      .getOverview()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load dashboard");
          if (err?.status === 401) router.replace("/");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return <Spinner />;

  const statusPie = Object.entries(data.toolStatus).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }));

  const views = data.stats.views ?? 0;
  const upvotes = data.stats.upvotes ?? 0;
  const saves = data.stats.saves ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete site overview — AI tools, blogs, users, engagement, and more.
          </p>
        </div>
        {data.dataSource && (
          <p className="text-xs text-muted-foreground">
            Source: <span className="font-medium text-foreground">{data.dataSource}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
        <StatCard
          label="AI Tools"
          value={data.stats.tools}
          icon={<Wrench size={17} />}
          accent="violet"
          hint={`${data.stats.publishedTools ?? data.toolStatus.published} published · ${data.featuredCount} featured`}
        />
        <StatCard
          label="Total Views"
          value={formatCount(views)}
          icon={<Eye size={17} />}
          accent="sky"
          hint="Tool page visits"
        />
        <StatCard
          label="Upvotes"
          value={formatCount(upvotes)}
          icon={<ArrowUp size={17} />}
          accent="emerald"
          hint="Community votes"
        />
        <StatCard
          label="Saves"
          value={formatCount(saves)}
          icon={<Bookmark size={17} />}
          accent="amber"
          hint="Bookmarks across tools"
        />
        <StatCard label="Users" value={data.stats.users} icon={<Users size={17} />} accent="emerald" />
        <StatCard
          label="Reviews"
          value={data.stats.reviews}
          icon={<Star size={17} />}
          accent="amber"
          hint={`${data.pending.reviews} pending`}
        />
        <StatCard
          label="Blog Posts"
          value={data.stats.posts}
          icon={<Newspaper size={17} />}
          hint={`${data.stats.featuredPosts ?? 0} featured`}
        />
        <StatCard
          label="Categories"
          value={data.stats.categories}
          icon={<FolderTree size={17} />}
          accent="sky"
        />
        <StatCard label="Tags" value={data.stats.tags} icon={<Tags size={17} />} />
        <StatCard label="Subscribers" value={data.stats.subscribers} icon={<Mail size={17} />} accent="rose" />
        <StatCard
          label="Submissions"
          value={data.stats.submissions}
          icon={<Inbox size={17} />}
          accent="amber"
          hint={`${data.pending.submissions} pending`}
        />
        <StatCard
          label="Consultations"
          value={data.stats.consultations}
          icon={<ShieldCheck size={17} />}
          accent="sky"
        />
      </div>

      {data.pending.reviews + data.pending.submissions > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          <span className="font-medium">Moderation queue:</span>
          {data.pending.reviews > 0 && (
            <Link href="/admin/reviews?status=pending" className="underline underline-offset-2">
              {data.pending.reviews} pending review{data.pending.reviews > 1 ? "s" : ""}
            </Link>
          )}
          {data.pending.submissions > 0 && (
            <Link href="/admin/submissions?status=pending" className="underline underline-offset-2">
              {data.pending.submissions} pending submission{data.pending.submissions > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Tools by category" description="Top categories from the live site catalog">
          <BarChart data={data.categoryChart} dataKey="count" />
        </Card>
        <Card title="Tool status & pricing" description="Published vs draft and pricing mix">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <DonutChart data={statusPie} dataKey="count" />
              <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                {statusPie.map((s) => (
                  <span key={s.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                    {s.name}: {s.count}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <DonutChart data={data.pricingChart || []} dataKey="count" />
              <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                {(data.pricingChart || []).map((s) => (
                  <span key={s.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    {s.name}: {s.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Most viewed tools"
          description="Highest page views across the site"
          actions={
            <Link href="/admin/tools" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {(data.topViewedTools || data.recentTools).map((t) => (
              <ToolListItem
                key={`view-${t._id}`}
                tool={t}
                meta={
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Eye size={12} /> {formatCount(t.clicks)}
                  </span>
                }
              />
            ))}
          </ul>
        </Card>

        <Card
          title="Most upvoted tools"
          description="Community engagement leaders"
          actions={
            <Link href="/admin/tools" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {(data.topUpvotedTools || data.recentTools).map((t) => (
              <ToolListItem
                key={`up-${t._id}`}
                tool={t}
                meta={
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <ArrowUp size={12} /> {formatCount(t.upvotes)}
                  </span>
                }
              />
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Recent tools"
          actions={
            <Link href="/admin/tools" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {data.recentTools.map((t) => (
              <ToolListItem key={t._id} tool={t} />
            ))}
          </ul>
        </Card>

        <Card
          title="Blog posts"
          description="Articles from site catalog and database"
          actions={
            <Link href="/admin/posts" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {(data.recentPosts || []).map((p) => (
              <li key={p._id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="block truncate text-sm font-medium text-foreground hover:text-primary"
                  >
                    {p.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.category}
                    {p.source ? ` · ${p.source}` : ""}
                    {p.excerpt ? ` · ${p.excerpt}` : ""}
                  </p>
                </div>
                <StatusBadge status={p.featured ? "featured" : "published"} />
              </li>
            ))}
            {(!data.recentPosts || data.recentPosts.length === 0) && (
              <li className="py-6 text-center text-xs text-muted-foreground">No blog posts yet.</li>
            )}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Recent users"
          actions={
            <Link href="/admin/users" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {data.recentUsers.map((u) => (
              <li key={u._id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{u.displayName || u.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <StatusBadge status={u.role} />
              </li>
            ))}
            {data.recentUsers.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">No users yet.</li>
            )}
          </ul>
        </Card>

        <Card
          title="Recent reviews"
          actions={
            <Link href="/admin/reviews" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {data.recentReviews.map((r) => (
              <li key={r._id} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex shrink-0 items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} fill={i < r.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="truncate text-sm font-medium text-foreground">{r.toolName}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  “{r.text}” — {r.userName || "Anonymous"}
                </p>
              </li>
            ))}
            {data.recentReviews.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">No reviews yet.</li>
            )}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Recent submissions"
          actions={
            <Link href="/admin/submissions" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {data.recentSubmissions.map((s) => (
              <li key={s._id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.category} · {s.website}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
            {data.recentSubmissions.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">No submissions yet.</li>
            )}
          </ul>
        </Card>

        <Card title="Recent activity" description="Latest super admin actions">
          <ul className="divide-y divide-border">
            {data.activity.map((a) => (
              <li key={a._id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    <span className="font-medium">{a.actor}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
            {data.activity.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No admin activity recorded yet.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

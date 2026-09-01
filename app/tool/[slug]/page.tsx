"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Star, ExternalLink, Check, X, ArrowUp, Eye } from "lucide-react";
import Link from "next/link";
import { SiteNav, SiteFooter, ToolCard, trending } from "../../routes/index";
import { ToolLogo } from "../../components/ToolLogo";
import { api } from "../../lib/api";
import { homepageFeaturedTools } from "../../lib/data/homepage-tools";

function fallbackToolFromSlug(slug: string) {
  const seed = homepageFeaturedTools.find((t) => t.slug === slug);
  if (!seed) return null;
  return {
    ...seed,
    clicks: 0,
    saves: Math.round(seed.reviews / 3),
    featured: true,
    status: "published",
  };
}

export default function ToolPage() {
  const params = useParams<{ slug: string }>();
  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [voted, setVoted] = useState(false);
  const [voteBusy, setVoteBusy] = useState(false);
  const [staticData, setStaticData] = useState<{
    fallbackFeatures: string[];
    fallbackPros: string[];
    fallbackCons: string[];
    trending: any[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/static/tools/static")
      .then((res) => res.json())
      .then(setStaticData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!params.slug) return;
    let cancelled = false;
    setLoading(true);
    api
      .getTool(params.slug)
      .then((data) => {
        if (!cancelled) setTool(data);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = fallbackToolFromSlug(params.slug);
        if (fallback) setTool(fallback);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  // Count a page open as a click (once per browser session per tool).
  useEffect(() => {
    if (!params.slug || !tool) return;
    const key = `vot_clicked_${params.slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // continue without session guard
    }
    api
      .recordToolClick(params.slug)
      .then((res) => {
        setTool((prev: any) =>
          prev ? { ...prev, clicks: res.clicks, upvotes: res.upvotes } : prev
        );
      })
      .catch(() => {});
  }, [params.slug, tool?.slug]);

  useEffect(() => {
    if (!params.slug) return;
    try {
      const raw = localStorage.getItem("vot_upvoted_tools");
      const list: string[] = raw ? JSON.parse(raw) : [];
      setVoted(list.includes(params.slug));
    } catch {
      setVoted(false);
    }
  }, [params.slug]);

  async function handleUpvote() {
    if (!tool?.slug || voteBusy) return;
    setVoteBusy(true);
    const nextVoted = !voted;
    setVoted(nextVoted);
    setTool((prev: any) =>
      prev
        ? { ...prev, upvotes: Math.max(0, Number(prev.upvotes || 0) + (nextVoted ? 1 : -1)) }
        : prev
    );
    try {
      const res = nextVoted
        ? await api.upvoteTool(tool.slug)
        : await api.removeToolUpvote(tool.slug);
      setTool((prev: any) =>
        prev ? { ...prev, upvotes: res.upvotes, clicks: res.clicks } : prev
      );
      const raw = localStorage.getItem("vot_upvoted_tools");
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = nextVoted
        ? Array.from(new Set([...list, tool.slug]))
        : list.filter((s) => s !== tool.slug);
      localStorage.setItem("vot_upvoted_tools", JSON.stringify(next));
    } catch {
      setVoted(!nextVoted);
      setTool((prev: any) =>
        prev
          ? {
              ...prev,
              upvotes: Math.max(0, Number(prev.upvotes || 0) + (nextVoted ? -1 : 1)),
            }
          : prev
      );
    } finally {
      setVoteBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <SiteNav />
        <div className="grid place-items-center py-32">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error || !tool) return notFound();

  const alternativeTrends = staticData?.trending || trending;
  const altSlugs = Array.isArray(tool.alternatives) ? tool.alternatives.filter(Boolean) : [];
  const alternatives = altSlugs.length > 0
    ? alternativeTrends.filter((t: any) => altSlugs.includes(t.slug)).concat(
        alternativeTrends.filter((t: any) => !altSlugs.includes(t.slug) && t.slug !== tool.slug)
      ).slice(0, 3)
    : alternativeTrends.filter((t: any) => t.slug !== tool.slug).slice(0, 3);
  const features = tool.features?.length > 0 ? tool.features : (staticData?.fallbackFeatures || ["API access with simple key auth", "Team workspaces and shared libraries", "Export to PNG, SVG, and JSON", "Integrations with Slack, Notion, Zapier"]);
  const pros = tool.pros?.length > 0 ? tool.pros : (staticData?.fallbackPros || ["Fast and responsive", "Generous free tier"]);
  const cons = tool.cons?.length > 0 ? tool.cons : (staticData?.fallbackCons || ["Limited offline mode"]);

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap gap-x-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link> /{" "}
          <Link href="/discover" className="hover:text-primary">Tools</Link> /{" "}
          <span className="inline-block max-w-[200px] truncate align-bottom text-foreground sm:max-w-none">{tool.name}</span>
        </nav>
        <header className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
          <div className="size-16 overflow-hidden rounded-2xl bg-surface-soft ring-1 ring-black/5 grid place-items-center shrink-0 sm:size-20">
            <ToolLogo name={tool.name} logo={tool.logo} website={tool.website || tool.url} size={56} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
            <p className="mt-1 text-muted-foreground">{tool.category} · {tool.pricing}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">{tool.rating}</span>
                <span className="text-sm text-muted-foreground">({tool.reviews} reviews)</span>
              </div>
              <button
                type="button"
                onClick={handleUpvote}
                disabled={voteBusy}
                aria-pressed={voted}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                  voted
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-border bg-card text-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <ArrowUp className="size-3.5" />
                {tool.upvotes || 0} upvotes
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Eye className="size-3.5" />
                {tool.clicks || 0} views
              </span>
            </div>
          </div>
          <a
            href={tool.website}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              // Count a website visit once per browser session per tool.
              const visitKey = `vot_visited_${tool.slug}`;
              let visited = false;
              try {
                visited = Boolean(sessionStorage.getItem(visitKey));
                if (!visited) sessionStorage.setItem(visitKey, "1");
              } catch {
                // continue without session guard
              }
              if (!visited && tool.slug) {
                api
                  .recordToolVisit(tool.slug)
                  .catch(() => {});
              }
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:w-auto"
          >
            Visit website <ExternalLink className="size-4" />
          </a>
        </header>

        <p className="mt-8 text-lg text-foreground/90 leading-relaxed">{tool.desc}</p>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Key features</h2>
          <ul className="mt-4 grid sm:grid-cols-2 gap-3">
            {features.map((f: string) => (
              <li key={f} className="flex items-start gap-2 rounded-xl border border-border bg-card p-4">
                <Check className="size-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Check className="size-4 text-emerald-600" /> Pros
            </h3>
            <ul className="mt-3 space-y-2">
              {pros.map((p: string) => (
                <li key={p} className="text-sm text-muted-foreground">+ {p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <X className="size-4 text-rose-600" /> Cons
            </h3>
            <ul className="mt-3 space-y-2">
              {cons.map((p: string) => (
                <li key={p} className="text-sm text-muted-foreground">- {p}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Alternatives to {tool.name}</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alternatives.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}

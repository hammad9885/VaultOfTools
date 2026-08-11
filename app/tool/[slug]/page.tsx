"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Star, ExternalLink, Check, X } from "lucide-react";
import Link from "next/link";
import { SiteNav, SiteFooter, ToolCard, trending } from "../../routes/index";
import Image from "next/image";
import { api } from "../../lib/api";

export default function ToolPage() {
  const params = useParams<{ slug: string }>();
  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
    api.getTool(params.slug)
      .then((data) => { if (!cancelled) setTool(data); })
      .catch(() => {
        if (cancelled) return;
        const trend = staticData?.trending || trending;
        const hardcoded = trend.find((t: any) => t.slug === params.slug);
        if (hardcoded) {
          setTool({ ...hardcoded, features: [], pros: [], cons: [] });
        } else {
          setError(true);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="grid place-items-center py-32">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error || !tool) return notFound();

  const alternativeTrends = staticData?.trending || trending;
  const alternatives = alternativeTrends.filter((t: any) => t.slug !== tool.slug).slice(0, 3);
  const features = tool.features?.length > 0 ? tool.features : (staticData?.fallbackFeatures || ["API access with simple key auth", "Team workspaces and shared libraries", "Export to PNG, SVG, and JSON", "Integrations with Slack, Notion, Zapier"]);
  const pros = tool.pros?.length > 0 ? tool.pros : (staticData?.fallbackPros || ["Fast and responsive", "Generous free tier"]);
  const cons = tool.cons?.length > 0 ? tool.cons : (staticData?.fallbackCons || ["Limited offline mode"]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap gap-x-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link> /{" "}
          <Link href="/discover" className="hover:text-primary">Tools</Link> /{" "}
          <span className="inline-block max-w-[200px] truncate align-bottom text-foreground sm:max-w-none">{tool.name}</span>
        </nav>
        <header className="flex flex-col sm:flex-row gap-6 sm:items-center">
          <div className="size-20 overflow-hidden rounded-2xl bg-surface-soft ring-1 ring-black/5 grid place-items-center shrink-0">
            {(() => {
              const src = tool.logo || alternativeTrends.find((t: any) => t.slug === tool.slug)?.logo;
              return src ? <Image src={src} alt={`${tool.name} logo`} width={64} height={64} className="size-16 object-contain" unoptimized /> : null;
            })()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{tool.name}</h1>
            <p className="mt-1 text-muted-foreground">{tool.category} · {tool.pricing}</p>
            <div className="mt-3 flex items-center gap-2">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-bold">{tool.rating}</span>
              <span className="text-sm text-muted-foreground">({tool.reviews} reviews)</span>
            </div>
          </div>
          <a
            href={tool.website}
            target="_blank"
            rel="noreferrer"
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

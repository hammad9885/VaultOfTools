"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Star, ExternalLink, Check, X, ArrowUp, Eye } from "lucide-react";
import Link from "next/link";
import { SiteNav, SiteFooter, ToolCard, trending } from "../../routes/index";
import { ToolLogo } from "../../components/ToolLogo";
import { api } from "../../lib/api";
import { homepageFeaturedTools } from "../../lib/data/homepage-tools";

type ToolRecord = {
  slug: string;
  name: string;
  category: string;
  pricing: string;
  rating: number;
  reviews: number;
  desc?: string;
  website?: string;
  url?: string;
  logo?: string | null | { src: string };
  features?: string[];
  pros?: string[];
  cons?: string[];
  alternatives?: string[];
  upvotes?: number;
  clicks?: number;
};

type StaticData = {
  fallbackFeatures: string[];
  fallbackPros: string[];
  fallbackCons: string[];
  trending: ToolRecord[];
};

type TrendingTool = (typeof trending)[number] & {
  upvotes?: number;
  clicks?: number;
};

function logoSrc(logo: ToolRecord["logo"]): string | undefined {
  if (typeof logo === "string") return logo;
  if (logo && typeof logo === "object" && "src" in logo) {
    return logo.src;
  }
  return undefined;
}

function fallbackToolFromSlug(slug: string): ToolRecord | null {
  const seed = homepageFeaturedTools.find((t) => t.slug === slug);
  if (!seed) return null;

  return {
    slug: seed.slug,
    name: seed.name,
    category: seed.category,
    pricing: seed.pricing,
    rating: seed.rating,
    reviews: seed.reviews,
    desc: seed.desc,
    website: seed.website,
    logo: seed.logo,
    clicks: 0,
    upvotes: 0,
    features: seed.features,
    pros: seed.pros,
    cons: seed.cons,
  };
}

export default function ToolPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [tool, setTool] = useState<ToolRecord | null>(null);
  const [error, setError] = useState(false);
  const [voted, setVoted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    try {
      const raw = localStorage.getItem("vot_upvoted_tools");
      const list: string[] = raw ? JSON.parse(raw) : [];
      return list.includes(slug);
    } catch {
      return false;
    }
  });
  const [voteBusy, setVoteBusy] = useState(false);
  const [staticData, setStaticData] = useState<StaticData | null>(null);
  const clickedSlugs = useRef<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/static/tools/static")
      .then((res) => res.json())
      .then((data: StaticData) => setStaticData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    api
      .getTool(slug)
      .then((data) => {
        if (!cancelled) setTool(data as ToolRecord);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = fallbackToolFromSlug(slug);
        if (fallback) setTool(fallback);
        else setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug || !tool || clickedSlugs.current[slug]) return;

    clickedSlugs.current[slug] = true;

    api
      .recordToolClick(slug)
      .then((res: { clicks: number; upvotes: number }) => {
        setTool((prev) =>
          prev ? { ...prev, clicks: res.clicks, upvotes: res.upvotes } : prev
        );
      })
      .catch(() => {});
  }, [slug, tool]);

  async function handleUpvote() {
    if (!tool?.slug || voteBusy) return;

    setVoteBusy(true);
    const nextVoted = !voted;
    setVoted(nextVoted);
    setTool((prev) =>
      prev
        ? {
            ...prev,
            upvotes: Math.max(
              0,
              Number(prev.upvotes || 0) + (nextVoted ? 1 : -1)
            ),
          }
        : prev
    );

    try {
      const res = nextVoted
        ? await api.upvoteTool(tool.slug)
        : await api.removeToolUpvote(tool.slug);

      const payload = res as { upvotes?: number; clicks?: number };
      setTool((prev) =>
        prev
          ? {
              ...prev,
              upvotes: payload.upvotes ?? prev.upvotes,
              clicks: payload.clicks ?? prev.clicks,
            }
          : prev
      );

      const raw = localStorage.getItem("vot_upvoted_tools");
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = nextVoted
        ? Array.from(new Set([...list, tool.slug]))
        : list.filter((item) => item !== tool.slug);
      localStorage.setItem("vot_upvoted_tools", JSON.stringify(next));
    } catch {
      setVoted(!nextVoted);
      setTool((prev) =>
        prev
          ? {
              ...prev,
              upvotes: Math.max(
                0,
                Number(prev.upvotes || 0) + (nextVoted ? -1 : 1)
              ),
            }
          : prev
      );
    } finally {
      setVoteBusy(false);
    }
  }

  const loading = !error && !tool && Boolean(slug);

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

  const alternativeTrends: ToolRecord[] =
    staticData?.trending ??
    trending.map((item) => ({
      slug: item.slug,
      name: item.name,
      category: item.category,
      pricing: item.pricing,
      rating: item.rating,
      reviews: item.reviews,
      desc: item.desc,
      website: item.website,
      logo: logoSrc(item.logo),
      upvotes: item.upvotes,
      clicks: item.clicks,
    }));

  const altSlugs = Array.isArray(tool.alternatives)
    ? tool.alternatives.filter((item): item is string => Boolean(item))
    : [];

  const alternatives =
    altSlugs.length > 0
      ? alternativeTrends
          .filter((item) => altSlugs.includes(item.slug))
          .concat(
            alternativeTrends.filter(
              (item) => !altSlugs.includes(item.slug) && item.slug !== tool.slug
            )
          )
          .slice(0, 3)
      : alternativeTrends
          .filter((item) => item.slug !== tool.slug)
          .slice(0, 3);

  const features =
    tool.features?.length > 0
      ? tool.features
      : staticData?.fallbackFeatures ?? [
          "API access with simple key auth",
          "Team workspaces and shared libraries",
          "Export to PNG, SVG, and JSON",
          "Integrations with Slack, Notion, Zapier",
        ];

  const pros =
    tool.pros?.length > 0
      ? tool.pros
      : staticData?.fallbackPros ?? ["Fast and responsive", "Generous free tier"];

  const cons =
    tool.cons?.length > 0
      ? tool.cons
      : staticData?.fallbackCons ?? ["Limited offline mode"];

  const alternativeCards: TrendingTool[] = alternatives.map((item) => ({
    slug: item.slug,
    name: item.name,
    category: item.category,
    pricing: item.pricing as (typeof trending)[number]["pricing"],
    rating: item.rating,
    reviews: item.reviews,
    desc: item.desc || "",
    website: item.website || "",
    logo: logoSrc(item.logo) as (typeof trending)[number]["logo"],
    upvotes: item.upvotes || 0,
    clicks: item.clicks || 0,
  }));

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav className="mb-6 flex flex-wrap gap-x-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/discover" className="hover:text-primary">
            Tools
          </Link>{" "}
          /{" "}
          <span className="inline-block max-w-50 truncate align-bottom text-foreground sm:max-w-none">
            {tool.name}
          </span>
        </nav>

        <header className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-surface-soft ring-1 ring-black/5 sm:size-20">
            <ToolLogo
              name={tool.name}
              logo={logoSrc(tool.logo)}
              website={tool.website || tool.url}
              size={56}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              {tool.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {tool.category} · {tool.pricing}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">{tool.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({tool.reviews} reviews)
                </span>
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
              const visitKey = `vot_visited_${tool.slug}`;
              let visited = false;

              try {
                visited = Boolean(sessionStorage.getItem(visitKey));
                if (!visited) sessionStorage.setItem(visitKey, "1");
              } catch {}

              if (!visited && tool.slug) {
                api.recordToolVisit(tool.slug).catch(() => {});
              }
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:w-auto"
          >
            Visit website <ExternalLink className="size-4" />
          </a>
        </header>

        <p className="mt-8 text-lg leading-relaxed text-foreground/90">
          {tool.desc}
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Key features</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 sm:p-4"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground">
              <Check className="size-4 text-emerald-600" /> Pros
            </h3>
            <ul className="mt-3 space-y-2">
              {pros.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  + {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h3 className="flex items-center gap-2 font-bold text-foreground">
              <X className="size-4 text-rose-600" /> Cons
            </h3>
            <ul className="mt-3 space-y-2">
              {cons.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  - {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10 sm:mt-12">
          <h2 className="text-xl font-bold">Alternatives to {tool.name}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
            {alternativeCards.map((item) => (
              <ToolCard key={item.slug} tool={item} />
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}

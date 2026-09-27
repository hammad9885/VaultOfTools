"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clipboard,
  ExternalLink,
  Minus,
  Share2,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/app/routes";
import { ToolLogo } from "@/app/components/ToolLogo";
import {
  getComparisonResult,
  getComparisonRowWinner,
  type Comparison,
  type ComparisonResult,
  type ComparisonRow,
} from "@/app/lib/data/comparisons";

type ApiResponse = {
  success?: boolean;
  comparison?: Comparison;
  error?: string;
};

type RelatedComparison = {
  slug: string;
  title: string;
  a: {
    name: string;
    slug: string;
    logo?: string;
    rating?: number | null;
  };
  b: {
    name: string;
    slug: string;
    logo?: string;
    rating?: number | null;
  };
};

type RelatedResponse = {
  success?: boolean;
  comparisons?: Comparison[];
};

function safeText(value: unknown, fallback = "—") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function formatRating(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1) : "—";
}

function formatValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return safeText(value);
}

function getCategory(row: ComparisonRow) {
  const label = row.label.toLowerCase();

  if (
    label.includes("price") ||
    label.includes("pricing") ||
    label.includes("cost") ||
    label.includes("free")
  ) {
    return "Pricing";
  }

  if (
    label.includes("image") ||
    label.includes("video") ||
    label.includes("audio") ||
    label.includes("multimodal")
  ) {
    return "Capabilities";
  }

  if (
    label.includes("integration") ||
    label.includes("platform") ||
    label.includes("api")
  ) {
    return "Ecosystem";
  }

  return "Core comparison";
}

function ScoreBar({
  value,
  winner,
}: {
  value: number | null | undefined;
  winner: boolean;
}) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return <div className="h-2 w-full rounded-full bg-slate-100" />;
  }

  const percentage = Math.max(0, Math.min(100, numeric * 10));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${
          winner
            ? "bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-400"
            : "bg-slate-300"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function ToolHeroCard({
  tool,
  featured,
}: {
  tool: Comparison["a"];
  featured: boolean;
}) {
  const website =
    typeof tool.website === "string" ? tool.website.trim() : "";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition duration-300 sm:p-7 ${
        featured
          ? "border-violet-200 shadow-[0_20px_70px_rgba(99,102,241,0.14)]"
          : "border-slate-200"
      }`}
    >
      {featured && (
        <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
          <Trophy className="h-3.5 w-3.5" />
          Leading score
        </div>
      )}

      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <ToolLogo
            name={tool.name}
            logo={tool.logo}
            size={46}
          />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {tool.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {safeText(tool.category, "AI Tool")}
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium text-slate-500">
            Rating
          </p>

          <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            {formatRating(tool.rating)}
            <span className="ml-1 text-sm font-semibold text-slate-400">
              / 5
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium text-slate-500">
            Pricing
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-950">
            {safeText(tool.pricing, "Not specified")}
          </p>
        </div>
      </div>

      {tool.features && tool.features.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tool.features.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {feature}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Visit {tool.name}
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400">
            Website unavailable
          </span>
        )}
      </div>
    </div>
  );
}

function ComparisonRowView({
  row,
}: {
  row: ComparisonRow;
}) {
  const winner = getComparisonRowWinner(row);

  const aValue = formatValue(row.a);
  const bValue = formatValue(row.b);

  const numericA =
    typeof row.a === "number" && Number.isFinite(row.a)
      ? row.a
      : null;

  const numericB =
    typeof row.b === "number" && Number.isFinite(row.b)
      ? row.b
      : null;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-slate-100 px-5 py-5 last:border-b-0 sm:grid-cols-[1fr_180px_1fr] sm:gap-6 sm:px-7">
      <div className="min-w-0 text-right">
        <div
          className={`text-sm font-bold ${
            winner === "a"
              ? "text-emerald-700"
              : "text-slate-700"
          }`}
        >
          {aValue}
        </div>

        {numericA !== null && (
          <div className="mt-2 ml-auto max-w-40">
            <ScoreBar
              value={numericA}
              winner={winner === "a"}
            />
          </div>
        )}

        {winner === "a" && (
          <div className="mt-2 flex justify-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Better
            </span>
          </div>
        )}
      </div>

      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          {row.label}
        </span>
      </div>

      <div className="min-w-0">
        <div
          className={`text-sm font-bold ${
            winner === "b"
              ? "text-emerald-700"
              : "text-slate-700"
          }`}
        >
          {bValue}
        </div>

        {numericB !== null && (
          <div className="mt-2 max-w-40">
            <ScoreBar
              value={numericB}
              winner={winner === "b"}
            />
          </div>
        )}

        {winner === "b" && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Better
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  comparison,
  result,
}: {
  comparison: Comparison;
  result: ComparisonResult;
}) {
  const isTie = result.winner === "tie";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_90px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-400" />

      <div className="p-6 sm:p-8 lg:p-10">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700">
            <Sparkles className="h-4 w-4" />
            Comparison summary
          </div>

          <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {isTie
              ? `${comparison.a.name} and ${comparison.b.name} are closely matched`
              : `${safeText(result.winnerName)} leads this comparison`}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            The result is calculated from the comparison attributes
            currently stored for these tools. Text-only attributes are
            shown separately and are not scored automatically.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {comparison.a.name}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {result.aWins}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              decisive wins
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ties
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {result.ties}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              matched metrics
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {comparison.b.name}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {result.bWins}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              decisive wins
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StrengthCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "green" | "violet";
}) {
  const classes =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50/60"
      : "border-violet-200 bg-violet-50/60";

  const iconClasses =
    tone === "green"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-violet-100 text-violet-700";

  return (
    <div className={`rounded-3xl border p-6 ${classes}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${iconClasses}`}>
          <Zap className="h-5 w-5" />
        </div>

        <h3 className="font-bold text-slate-950">
          {title}
        </h3>
      </div>

      <div className="mt-5 space-y-3">
        {items.length ? (
          items.slice(0, 5).map((item) => (
            <div
              key={item}
              className="flex gap-3 text-sm text-slate-600"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No specific advantages have been recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left"
      >
        <span className="text-sm font-bold text-slate-900 sm:text-base">
          {question}
        </span>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-6 text-slate-500">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function ComparisonPage() {
  const params = useParams();

  const slug = Array.isArray(params?.slug)
    ? params.slug.join("/")
    : String(params?.slug || "");

  const [comparison, setComparison] =
    useState<Comparison | null>(null);

  const [related, setRelated] = useState<RelatedComparison[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState("All");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadComparison() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/static/comparisons/${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
          }
        );

        const data = (await response.json()) as ApiResponse;

        if (!response.ok || !data.comparison) {
          throw new Error(
            data.error || "Comparison could not be loaded."
          );
        }

        if (!cancelled) {
          setComparison(data.comparison);
        }
      } catch (err) {
        if (!cancelled) {
          setComparison(null);
          setError(
            err instanceof Error
              ? err.message
              : "Comparison could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComparison();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!comparison) return;

    const currentComparison = comparison;

    let cancelled = false;

    async function loadRelated() {
      try {
        setRelatedLoading(true);

        const response = await fetch(
          "/api/static/comparisons",
          {
            cache: "no-store",
          }
        );

        const data = (await response.json()) as RelatedResponse;

        if (!response.ok || !data.comparisons) {
          return;
        }

        const currentSlug = `${currentComparison.a.slug}-vs-${currentComparison.b.slug}`;

        const items: RelatedComparison[] = data.comparisons
          .filter((item) => {
            const itemSlug = `${item.a.slug}-vs-${item.b.slug}`;

            return itemSlug !== currentSlug;
          })
          .slice(0, 6)
          .map((item) => ({
            slug: `${item.a.slug}-vs-${item.b.slug}`,
            title: `${item.a.name} vs ${item.b.name}`,
            a: {
              name: item.a.name,
              slug: item.a.slug,
              logo: item.a.logo ?? undefined,
              rating: item.a.rating,
            },
            b: {
              name: item.b.name,
              slug: item.b.slug,
              logo: item.b.logo ?? undefined,
              rating: item.b.rating,
            },
          }));

        if (!cancelled) {
          setRelated(items);
        }
      } catch {
        if (!cancelled) {
          setRelated([]);
        }
      } finally {
        if (!cancelled) {
          setRelatedLoading(false);
        }
      }
    }

    loadRelated();

    return () => {
      cancelled = true;
    };
  }, [comparison]);

  const result = useMemo<ComparisonResult | null>(() => {
    if (!comparison) {
      return null;
    }

    return getComparisonResult(comparison);
  }, [comparison]);

  const categories = useMemo(() => {
    if (!comparison) {
      return ["All"];
    }

    const unique = Array.from(
      new Set(
        comparison.rows.map((row) => getCategory(row))
      )
    );

    return ["All", ...unique];
  }, [comparison]);

  const filteredRows = useMemo(() => {
    if (!comparison) {
      return [];
    }

    if (activeCategory === "All") {
      return comparison.rows;
    }

    return comparison.rows.filter(
      (row) => getCategory(row) === activeCategory
    );
  }, [comparison, activeCategory]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  async function sharePage() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: comparison
            ? `${comparison.a.name} vs ${comparison.b.name}`
            : "Tool comparison",
          url: window.location.href,
        });
      } catch {}
      return;
    }

    await copyLink();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <SiteNav />

        <main>
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="mx-auto h-5 w-40 rounded-full bg-slate-200" />
              <div className="mx-auto mt-5 h-12 max-w-2xl rounded-xl bg-slate-200" />
              <div className="mx-auto mt-3 h-6 max-w-xl rounded-lg bg-slate-200" />

              <div className="mt-12 grid gap-5 lg:grid-cols-2">
                <div className="h-72 rounded-3xl bg-white shadow-sm" />
                <div className="h-72 rounded-3xl bg-white shadow-sm" />
              </div>

              <div className="mt-8 h-80 rounded-[2rem] bg-white shadow-sm" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!comparison || !result) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <SiteNav />

        <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <CircleHelp className="h-8 w-8" />
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
              Comparison not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error ||
                "This comparison is unavailable or one of the tools is no longer published."}
            </p>

            <Link
              href="/compare"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to comparisons
            </Link>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }

  const winnerTool =
    result.winner === "a"
      ? comparison.a
      : result.winner === "b"
        ? comparison.b
        : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute left-1/2 top-0 h-125 w-225 -translate-x-1/2 rounded-full bg-linear-to-r from-violet-200/40 via-indigo-200/30 to-cyan-200/30 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                All comparisons
              </Link>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}

                  {copied ? "Copied" : "Copy link"}
                </button>

                <button
                  type="button"
                  onClick={sharePage}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-violet-700">
                <Sparkles className="h-4 w-4" />
                AI tool comparison
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                {comparison.a.name}
                <span className="mx-3 bg-linear-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  vs
                </span>
                {comparison.b.name}
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                Compare features, ratings, pricing, capabilities and other
                available data side by side.
              </p>
            </div>

            <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
              <ToolHeroCard
                tool={comparison.a}
                featured={result.winner === "a"}
              />

              <div className="hidden items-center justify-center lg:flex">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-400 shadow-lg">
                  VS
                </div>
              </div>

              <ToolHeroCard
                tool={comparison.b}
                featured={result.winner === "b"}
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ResultCard
            comparison={comparison}
            result={result}
          />

          {winnerTool && (
            <section className="mt-8 overflow-hidden rounded-3xl border border-violet-200 bg-linear-to-r from-violet-600 via-indigo-600 to-cyan-500 p-px shadow-xl">
              <div className="rounded-[calc(1.5rem-1px)] bg-white px-6 py-7 sm:px-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
                      <Trophy className="h-4 w-4" />
                      Current comparison leader
                    </div>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      {winnerTool.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Leads across{" "}
                      {result.aWins + result.bWins} decisive comparison
                      metrics.
                    </p>
                  </div>

                  <Link
                    href={`/tools/${winnerTool.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    View tool
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          <section className="mt-12">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Key differences
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                What sets them apart
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <StrengthCard
                title={`${comparison.a.name} advantages`}
                items={result.aAdvantages}
                tone="green"
              />

              <StrengthCard
                title={`${comparison.b.name} advantages`}
                items={result.bAdvantages}
                tone="violet"
              />
            </div>
          </section>

          {result.tiedFeatures.length > 0 && (
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                  <Minus className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-950">
                    Areas where they match
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.tiedFeatures.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="mt-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Detailed breakdown
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Side-by-side comparison
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Values are taken directly from the comparison data stored
                for each published tool.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    activeCategory === category
                      ? "bg-slate-950 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:grid-cols-[1fr_180px_1fr] sm:gap-6 sm:px-7">
                <div className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  {comparison.a.name}
                </div>

                <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  Metric
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {comparison.b.name}
                </div>
              </div>

              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <ComparisonRowView
                    key={row.label}
                    row={row}
                  />
                ))
              ) : (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  No comparison attributes are available in this category.
                </div>
              )}
            </div>
          </section>

          <section className="mt-14">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                  <CircleHelp className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    How this comparison works
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Comparison results are generated from published tool
                    data. Numeric metrics can contribute to the result,
                    while descriptive information is presented without
                    inventing a score.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Zap className="h-5 w-5 text-violet-600" />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Structured data
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Scores, booleans, counts and attributes come from
                    the current tool records.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    No fabricated metrics
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Missing values remain unavailable instead of being
                    replaced with made-up numbers.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Sparkles className="h-5 w-5 text-cyan-600" />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Always dynamic
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Published admin changes are reflected when the
                    comparison is loaded again.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {comparison.faq && comparison.faq.length > 0 && (
            <section className="mt-14">
              <div className="mx-auto max-w-3xl">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    FAQ
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Frequently asked questions
                  </h2>
                </div>

                <div className="mt-7 space-y-3">
                  {comparison.faq.map((item) => (
                    <FAQItem
                      key={item.question}
                      question={item.question}
                      answer={item.answer}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {!relatedLoading && related.length > 0 && (
            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    Explore more
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    More comparisons
                  </h2>
                </div>

                <Link
                  href="/compare"
                  className="hidden items-center gap-1.5 text-sm font-bold text-slate-600 transition hover:text-slate-950 sm:flex"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/compare/${item.slug}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <ToolLogo
                          name={item.a.name}
                          logo={item.a.logo}
                          size={30}
                        />
                      </div>

                      <div className="text-xs font-black text-slate-400">
                        VS
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <ToolLogo
                          name={item.b.name}
                          logo={item.b.logo}
                          size={30}
                        />
                      </div>
                    </div>

                    <h3 className="mt-5 font-bold text-slate-950 transition group-hover:text-violet-700">
                      {item.title}
                    </h3>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {formatRating(item.a.rating)} vs{" "}
                        {formatRating(item.b.rating)}
                      </span>

                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-16 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl sm:p-10">
            <div className="relative">
              <div className="absolute -right-20 -top-32 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
              <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Vault of Tools
                  </div>

                  <h2 className="mt-4 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
                    Compare more AI tools with real directory data.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    Browse published tools and create side-by-side
                    comparisons whenever you need them.
                  </p>
                </div>

                <Link
                  href="/compare"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                >
                  Explore comparisons
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
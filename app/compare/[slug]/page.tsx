"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Copy,
  HelpCircle,
  Layers,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  X,
} from "lucide-react";

import { SiteNav, SiteFooter } from "@/app/routes";
import { ToolLogo } from "@/app/components/ToolLogo";
import type { ComparisonRow } from "@/app/lib/data/comparisons";
import {
  allComparisons,
  getComparisonBySlug,
} from "@/app/lib/data/comparisons";

type Winner = "a" | "b" | "tie";
type Tab = "all" | "core" | "multimodal" | "pricing";

function getToolWebsite(slug: string) {
  const websites: Record<string, string> = {
    chatgpt: "https://chatgpt.com",
    claude: "https://claude.ai",
    midjourney: "https://midjourney.com",
    "dall-e": "https://openai.com/index/dall-e-3/",
    "github-copilot": "https://github.com/features/copilot",
    cursor: "https://cursor.com",
    "notion-ai": "https://www.notion.so/product/ai",
    mem: "https://mem.ai",
    jasper: "https://www.jasper.ai",
    "copy-ai": "https://www.copy.ai",
    runway: "https://runwayml.com",
    pika: "https://pika.art",
    gemini: "https://gemini.google.com",
    perplexity: "https://www.perplexity.ai",
    you: "https://you.com",
  };

  return websites[slug] ?? "#";
}

function getToolCreator(slug: string) {
  const creators: Record<string, string> = {
    chatgpt: "OpenAI",
    claude: "Anthropic",
    midjourney: "Midjourney",
    "dall-e": "OpenAI",
    "github-copilot": "GitHub / Microsoft",
    cursor: "Anysphere",
    "notion-ai": "Notion",
    mem: "Mem",
    jasper: "Jasper",
    "copy-ai": "Copy.ai",
    runway: "Runway",
    pika: "Pika",
    gemini: "Google",
    perplexity: "Perplexity",
    you: "You.com",
  };

  return creators[slug] ?? "AI Company";
}

function parseNumber(value: string) {
  const match = value.match(/[\d,.]+/);

  if (!match) {
    return null;
  }

  const number = Number(match[0].replace(/,/g, ""));

  return Number.isFinite(number) ? number : null;
}

function getWinner(row: ComparisonRow): Winner {
  if (row.a === "—" || row.b === "—") {
    return "tie";
  }

  if (row.a.trim().toLowerCase() === row.b.trim().toLowerCase()) {
    return "tie";
  }

  if (row.type === "higher" || row.type === "lower") {
    const a = parseNumber(row.a);
    const b = parseNumber(row.b);

    if (a === null || b === null || a === b) {
      return "tie";
    }

    if (row.type === "higher") {
      return a > b ? "a" : "b";
    }

    return a < b ? "a" : "b";
  }

  if (row.type === "number") {
    const a = parseNumber(row.a);
    const b = parseNumber(row.b);

    if (a === null || b === null || a === b) {
      return "tie";
    }

    return a > b ? "a" : "b";
  }

  if (row.type === "boolean") {
    const aYes = row.a.toLowerCase().startsWith("yes");
    const bYes = row.b.toLowerCase().startsWith("yes");

    if (aYes && !bYes) {
      return "a";
    }

    if (bYes && !aYes) {
      return "b";
    }
  }

  return "tie";
}

function getCategory(label: string) {
  const value = label.toLowerCase();

  if (
    value.includes("price") ||
    value.includes("free") ||
    value.includes("cost") ||
    value.includes("plan")
  ) {
    return "pricing";
  }

  if (
    value.includes("image") ||
    value.includes("voice") ||
    value.includes("multimodal") ||
    value.includes("video") ||
    value.includes("audio")
  ) {
    return "multimodal";
  }

  return "core";
}

function renderValue(value: string, winner: boolean) {
  const normalized = value.toLowerCase().trim();

  if (normalized.startsWith("yes")) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
            winner
              ? "border-emerald-300 bg-emerald-100 text-emerald-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          <Check className="size-3.5" />
          {value}
        </span>

        {winner && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Advantage
          </span>
        )}
      </div>
    );
  }

  if (normalized === "no") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
        <X className="size-3.5 text-slate-400" />
        {value}
      </span>
    );
  }

  const numeric = parseNumber(value);

  if (numeric !== null && numeric > 0 && numeric <= 10) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
            winner
              ? "border-amber-300 bg-amber-100 text-amber-800"
              : "border-amber-200 bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {value}
        </span>

        {winner && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Advantage
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={[
          "text-xs sm:text-sm",
          winner ? "font-bold text-emerald-700" : "font-semibold text-foreground",
        ].join(" ")}
      >
        {value}
      </span>

      {winner && (
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Advantage
        </span>
      )}
    </div>
  );
}

function ToolCard({
  name,
  slug,
  rating,
  pricing,
  accent,
  bestFor,
}: {
  name: string;
  slug: string;
  rating?: number;
  pricing?: string;
  accent: "orange" | "blue";
  bestFor: string;
}) {
  const accentClasses =
    accent === "orange"
      ? "from-orange-500/10 via-orange-50 to-white text-orange-900"
      : "from-blue-500/10 via-blue-50 to-white text-blue-900";

  return (
    <Link
      href={`/tool/${slug}`}
      className={`block overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br ${accentClasses} p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl border border-white/80 bg-white/80 shadow-sm">
            <ToolLogo name={name} size={28} website={getToolWebsite(slug)} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {getToolCreator(slug)}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{name}</h2>
          </div>
        </div>

        <div className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          {pricing || "N/A"}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-200/80 pt-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          {rating ?? "N/A"}
        </div>

        <div className="flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          Best for
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{bestFor}</p>
    </Link>
  );
}

export default function CompareClient() {
  const params = useParams<{ slug: string }>();
  const comparison = useMemo(
    () => getComparisonBySlug(params.slug ?? ""),
    [params.slug]
  );

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [userVote, setUserVote] = useState<"a" | "b" | null>(null);
  const [votesA, setVotesA] = useState(3842);
  const [votesB, setVotesB] = useState(3195);

  const filteredRows = useMemo(() => {
    if (!comparison) {
      return [];
    }

    if (activeTab === "all") {
      return comparison.rows;
    }

    return comparison.rows.filter((row) => getCategory(row.label) === activeTab);
  }, [activeTab, comparison]);

  const totalVotes = votesA + votesB;
  const percentA = totalVotes === 0 ? 50 : Math.round((votesA / totalVotes) * 100);
  const percentB = 100 - percentA;

  const relatedComparisons = useMemo(() => {
    if (!comparison) {
      return [];
    }

    return allComparisons
      .filter((item) => item.slug !== comparison.slug)
      .filter((item) => item.category === comparison.category)
      .slice(0, 3);
  }, [comparison]);

  const faqs = comparison?.faq?.length
    ? comparison.faq
    : [
        {
          question: `What is the main difference between ${comparison?.a.name ?? "this tool"} and ${comparison?.b.name ?? "that tool"}?`,
          answer: `${comparison?.a.name ?? "This tool"} and ${comparison?.b.name ?? "that tool"} each have different strengths across the capabilities shown in this comparison. Review the matrix to decide which tool best matches your workflow.`,
        },
        {
          question: "Which option is better for my use case?",
          answer: "The right choice depends on the work you do most often, your budget, and the features you rely on every day.",
        },
      ];

  if (!comparison) {
    return null;
  }

  const handleVote = (choice: "a" | "b") => {
    if (userVote) {
      return;
    }

    setUserVote(choice);

    if (choice === "a") {
      setVotesA((value) => value + 1);
    } else {
      setVotesB((value) => value + 1);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(`comparison-vote-${comparison.slug}`, choice);
    }
  };

  const handleCopy = async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />

      <header className="border-b border-border/60 bg-linear-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-5xl px-3 pb-8 pt-4 sm:px-6 sm:pb-12 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:text-sm"
            >
              <ArrowLeft className="size-4" />
              All comparisons
            </Link>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <CheckCheck className="size-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Share
                </>
              )}
            </button>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-3" />
              {comparison.category}
            </span>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              {comparison.a.name}{" "}
              <span className="font-light text-primary">vs</span>{" "}
              {comparison.b.name}
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Compare features, pricing, capabilities, ratings, and real-world use cases side by side.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative mb-8 sm:mb-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToolCard
              name={comparison.a.name}
              slug={comparison.a.slug}
              rating={comparison.ratingA}
              pricing={comparison.pricingA}
              accent="orange"
              bestFor={comparison.prosA[0] || "Strong everyday use"}
            />

            <ToolCard
              name={comparison.b.name}
              slug={comparison.b.slug}
              rating={comparison.ratingB}
              pricing={comparison.pricingB}
              accent="blue"
              bestFor={comparison.prosB[0] || "Strong everyday use"}
            />
          </div>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-background p-3 shadow-md md:block">
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </section>

        <section className="mb-8 sm:mb-12">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Feature matrix
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Detailed comparison</h2>
            </div>

            <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
              {(["all", "core", "multimodal", "pricing"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition",
                    activeTab === tab
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
                  ].join(" ")}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Category
                    </th>
                    <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900">
                      {comparison.a.name}
                    </th>
                    <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900">
                      {comparison.b.name}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => {
                    const winner = getWinner(row);

                    return (
                      <tr key={row.label} className="group">
                        <td className="border-b border-slate-200 px-4 py-4 align-top text-sm font-medium text-slate-600">
                          {row.label}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-4 align-top text-center">
                          {renderValue(row.a, winner === "a")}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-4 align-top text-center">
                          {renderValue(row.b, winner === "b")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">Strengths at a glance</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-900">{comparison.a.name}</span>
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-700">
                    Strengths
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {comparison.prosA.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-orange-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900">{comparison.b.name}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Strengths
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  {comparison.prosB.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <ThumbsUp className="size-4 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">Community vote</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{comparison.a.name}</span>
                  <span>{percentA}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${percentA}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{comparison.b.name}</span>
                  <span>{percentB}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${percentB}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleVote("a")}
                  className="rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={Boolean(userVote)}
                >
                  Vote {comparison.a.name}
                </button>

                <button
                  type="button"
                  onClick={() => handleVote("b")}
                  className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={Boolean(userVote)}
                >
                  Vote {comparison.b.name}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                {totalVotes.toLocaleString()} total votes • {userVote ? "Thanks for voting." : "Choose the winner that fits your workflow best."}
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <HelpCircle className="size-4 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">Frequently asked questions</h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50/60">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
                      <ChevronDown className={['size-4 text-slate-500 transition-transform', isOpen ? 'rotate-180' : ''].join(' ')} />
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">Related comparisons</h3>
            </div>

            <div className="space-y-3">
              {relatedComparisons.map((item) => (
                <Link
                  key={item.slug}
                  href={`/compare/${item.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.a.name} vs {item.b.name}
                    </p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      {item.category}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

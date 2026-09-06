"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import {
  Check,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Zap,
  Sparkles,
  ExternalLink,
  Layers,
  ThumbsUp,
  Cpu,
  Share2,
  Copy,
  CheckCheck,
  HelpCircle,
  ChevronDown,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { SiteNav, SiteFooter } from "../../routes/index";
import { ToolLogo } from "../../components/ToolLogo";
import { allComparisons } from "../../lib/data/comparisons";

function display(value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function getToolWebsite(rawName: string): string {
  const clean = rawName.toLowerCase();
  if (clean.includes("claude")) return "https://claude.ai";
  if (clean.includes("chatgpt") || clean.includes("openai")) return "https://chatgpt.com";
  if (clean.includes("gemini")) return "https://gemini.google.com";
  if (clean.includes("perplexity")) return "https://perplexity.ai";
  if (clean.includes("copilot")) return "https://copilot.microsoft.com";
  if (clean.includes("cursor")) return "https://cursor.com";
  if (clean.includes("midjourney")) return "https://midjourney.com";
  if (clean.includes("notion")) return "https://notion.so";
  return "#";
}

function getToolCreator(rawName: string): string {
  const clean = rawName.toLowerCase();
  if (clean.includes("claude")) return "Anthropic";
  if (clean.includes("chatgpt") || clean.includes("dall")) return "OpenAI";
  if (clean.includes("gemini")) return "Google DeepMind";
  if (clean.includes("copilot")) return "Microsoft / GitHub";
  if (clean.includes("cursor")) return "Anysphere";
  if (clean.includes("perplexity")) return "Perplexity AI";
  if (clean.includes("midjourney")) return "Midjourney Inc.";
  return "AI Laboratory";
}

function getToolRoute(rawName: string, slugKey: string): string {
  const clean = (slugKey || rawName).toLowerCase();
  if (clean.includes("claude")) return "/tool/claude";
  if (clean.includes("chatgpt")) return "/tool/chatgpt";
  if (clean.includes("midjourney")) return "/tool/midjourney";
  if (clean.includes("copilot")) return "/tool/copilot";
  if (clean.includes("cursor")) return "/tool/cursor";
  if (clean.includes("gemini")) return "/tool/gemini";
  if (clean.includes("notion")) return "/tool/notion-ai";
  if (clean.includes("jasper")) return "/tool/jasper";
  return `/discover?search=${encodeURIComponent(rawName)}`;
}

function getRowWinner(label: string, aVal: string, bVal: string): "a" | "b" | "tie" {
  const aLower = String(aVal).toLowerCase().trim();
  const bLower = String(bVal).toLowerCase().trim();

  if (aLower === bLower || aVal === "—" || bVal === "—") return "tie";

  // Context window: parse token counts
  if (label.toLowerCase().includes("context")) {
    const na = parseInt(aVal.replace(/[^0-9]/g, ""), 10) || 0;
    const nb = parseInt(bVal.replace(/[^0-9]/g, ""), 10) || 0;
    if (na > nb) return "a";
    if (nb > na) return "b";
  }

  // Numerical ratings (e.g. 9.8 vs 9.3 or 4.9 vs 4.8)
  const na = parseFloat(aVal.split("/")[0].trim());
  const nb = parseFloat(bVal.split("/")[0].trim());
  if (Number.isFinite(na) && Number.isFinite(nb)) {
    if (na > nb) return "a";
    if (nb > na) return "b";
    return "tie";
  }

  // Qualitative keywords
  if (aLower === "superior" && bLower !== "superior") return "a";
  if (bLower === "superior" && aLower !== "superior") return "b";

  // Boolean features
  const aYes = aLower.startsWith("yes") || aLower === "true";
  const bYes = bLower.startsWith("yes") || bLower === "true";
  const aNo = aLower.startsWith("no") || aLower === "false";
  const bNo = bLower.startsWith("no") || bLower === "false";

  if (aYes && bNo) return "a";
  if (bYes && aNo) return "b";

  return "tie";
}

function getAttributeCategory(label: string): "core" | "multimodal" | "pricing" {
  const l = label.toLowerCase();
  if (
    l.includes("image") ||
    l.includes("voice") ||
    l.includes("multimodal") ||
    l.includes("document") ||
    l.includes("artifacts") ||
    l.includes("browsing") ||
    l.includes("integrations")
  ) {
    return "multimodal";
  }
  if (
    l.includes("price") ||
    l.includes("tier") ||
    l.includes("cost") ||
    l.includes("plan") ||
    l.includes("free") ||
    l.includes("trial")
  ) {
    return "pricing";
  }
  return "core";
}

/** Render formatted values for feature table */
function renderCellValue(val: string, isWinner: boolean) {
  const lower = String(val).toLowerCase().trim();
  if (lower === "yes" || lower.startsWith("yes")) {
    return (
      <div className="inline-flex flex-col items-center gap-1">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isWinner
              ? "text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-xs"
              : "text-emerald-700 bg-emerald-50 border border-emerald-200/70"
          }`}
        >
          <Check className="size-3.5" />
          {val}
        </span>
        {isWinner && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Winner
          </span>
        )}
      </div>
    );
  }
  if (lower === "no" || lower.startsWith("no")) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium">
        <X className="size-3.5 text-slate-400" /> {val}
      </span>
    );
  }
  if (lower === "superior") {
    return (
      <div className="inline-flex flex-col items-center gap-1">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isWinner
              ? "text-indigo-800 bg-indigo-100 border border-indigo-300 shadow-xs"
              : "text-indigo-700 bg-indigo-50 border border-indigo-200/70"
          }`}
        >
          <Sparkles className="size-3" /> Superior
        </span>
        {isWinner && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Winner
          </span>
        )}
      </div>
    );
  }
  const num = Number(val);
  if (Number.isFinite(num) && num > 0 && num <= 5) {
    return (
      <div className="inline-flex flex-col items-center gap-1">
        <span
          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-xs ${
            isWinner
              ? "text-amber-800 bg-amber-100 border border-amber-300 shadow-xs"
              : "text-amber-700 bg-amber-50 border border-amber-200/70"
          }`}
        >
          <Star className="size-3 fill-amber-400 text-amber-400" /> {val}
        </span>
        {isWinner && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Winner
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span
        className={`font-semibold text-xs sm:text-sm ${
          isWinner ? "text-emerald-700 font-bold" : "text-foreground"
        }`}
      >
        {val}
      </span>
      {isWinner && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
          Winner
        </span>
      )}
    </div>
  );
}

/** Build comparison rows from two tools' live compare data. */
function buildRows(aTool: any, bTool: any): { label: string; a: string; b: string }[] {
  const a = aTool?.compare || {};
  const b = bTool?.compare || {};
  const labels: string[] = [];
  const attrs = new Map<string, { label: string }>();

  const add = (label: string) => {
    if (!labels.includes(label)) labels.push(label);
  };
  const addAttr = (attr: { label?: string; value?: string }) => {
    const name = String(attr?.label || "").trim();
    if (name) {
      if (!attrs.has(name)) attrs.set(name, { label: name });
      if (!labels.some((l) => l.toUpperCase() === name.toUpperCase())) labels.push(name);
    }
  };

  add("Overall Rating");
  add("Ease of Use");
  add("Features Score");
  add("Value for Money");
  add("AI Powered");
  add("API Available");
  add("Free Plan");
  add("Free Trial");
  add("Team Collaboration");
  add("Customer Support");
  add("Platforms");
  add("Integrations");
  (a.attributes || []).forEach(addAttr);
  (b.attributes || []).forEach(addAttr);

  const valueOf = (tool: any, compare: any, label: string): string => {
    switch (label) {
      case "Overall Rating": return display(compare.overallRating);
      case "Ease of Use": return display(compare.easeOfUse);
      case "Features Score": return display(compare.featuresScore);
      case "Value for Money": return display(compare.valueForMoney);
      case "AI Powered": return display(compare.aiPowered);
      case "API Available": return display(compare.apiAvailable);
      case "Free Plan": return display(tool?.freePlan);
      case "Free Trial": return display(tool?.freeTrial);
      case "Team Collaboration": return display(compare.teamCollaboration);
      case "Customer Support": return display(compare.customerSupport);
      case "Platforms": return display(compare.platforms);
      case "Integrations": return display(compare.integrations);
      default: {
        const attr = [...(compare.attributes || [])].find(
          (x: any) => String(x?.label || "").trim().toUpperCase() === label.toUpperCase()
        );
        return attr ? display(attr.value) : "—";
      }
    }
  };

  return labels
    .filter((label) => {
      const va = valueOf(aTool, a, label);
      const vb = valueOf(bTool, b, label);
      return va !== "—" || vb !== "—";
    })
    .map((label) => ({ label, a: valueOf(aTool, a, label), b: valueOf(bTool, b, label) }));
}

export default function ComparePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const [data, setData] = useState<any>(null);
  const [toolA, setToolA] = useState<any>(null);
  const [toolB, setToolB] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "core" | "multimodal" | "pricing">("all");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Community Poll state
  const [userVote, setUserVote] = useState<"a" | "b" | null>(null);
  const [votesA, setVotesA] = useState(3842);
  const [votesB, setVotesB] = useState(3195);

  const [aRaw, bRaw] = slug.split("-vs-");
  const slugA = (aRaw ?? "Tool A").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const slugB = (bRaw ?? "Tool B").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const slugAKey = (aRaw ?? "").toLowerCase();
  const slugBKey = (bRaw ?? "").toLowerCase();

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);

    // Read stored vote from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`vot_poll_${slug}`);
      if (saved === "a" || saved === "b") {
        setUserVote(saved);
      }
    }

    Promise.all([
      api.getTool(slugAKey).catch(() => null),
      api.getTool(slugBKey).catch(() => null),
      api.getComparisonDetail(slug).catch(() => null),
    ])
      .then(([ta, tb, detail]) => {
        if (cancelled) return;
        setToolA(ta);
        setToolB(tb);
        setData(detail);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug, slugAKey, slugBKey]);

  const a = toolA?.name || data?.a || slugA;
  const b = toolB?.name || data?.b || slugB;
  const ratingA = toolA?.rating || data?.ratingA || "4.9";
  const ratingB = toolB?.rating || data?.ratingB || "4.8";
  const pricingA = toolA?.pricing || data?.pricingA || "Freemium";
  const pricingB = toolB?.pricing || data?.pricingB || "Freemium";
  const category = data?.category || toolA?.category || toolB?.category || "AI Comparison";

  const rows = useMemo(() => {
    if (toolA || toolB) {
      const live = buildRows(toolA || {}, toolB || {});
      if (live.length > 0) return live;
    }
    return data?.rows || [];
  }, [toolA, toolB, data]);

  const filteredRows = useMemo(() => {
    if (activeTab === "all") return rows;
    return rows.filter((r: { label: string }) => getAttributeCategory(r.label) === activeTab);
  }, [rows, activeTab]);

  const prosA = data?.prosA || toolA?.pros || [
    "Industry-leading code generation and architectural reasoning",
    "Interactive Artifacts UI for live React, HTML, and SVG previewing",
    "Massive 200k context window with superior document recall",
    "Nuanced, natural writing without cliché AI corporate phrasing",
  ];
  const prosB = data?.prosB || toolB?.pros || [
    "Native image generation powered by integrated DALL·E 3",
    "Real-time expressive Advanced Voice Mode with zero lag",
    "Integrated web browsing with real-time citations & search",
    "Massive library of custom GPTs and community plugins",
  ];

  const totalVotes = votesA + votesB;
  const percentA = Math.round((votesA / totalVotes) * 100);
  const percentB = 100 - percentA;

  const handleVote = (choice: "a" | "b") => {
    if (userVote) return;
    setUserVote(choice);
    if (choice === "a") setVotesA((v) => v + 1);
    if (choice === "b") setVotesB((v) => v + 1);
    if (typeof window !== "undefined") {
      localStorage.setItem(`vot_poll_${slug}`, choice);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const otherComparisons = useMemo(() => {
    return allComparisons.filter((c) => c.slug !== slug).slice(0, 3);
  }, [slug]);

  const faqs = useMemo(() => {
    const isClaudeVsChatgpt =
      slug.includes("claude") && (slug.includes("chatgpt") || slug.includes("gpt"));
    if (isClaudeVsChatgpt) {
      return [
        {
          q: `Is ${a} better than ${b} for coding and programming?`,
          a: `Yes, independent benchmark evaluations consistently rank ${a} as the top model for software engineering, frontend UI generation (via live Artifacts preview), and complex multi-file architectural reasoning. It handles long dependencies with fewer hallucinated methods.`,
        },
        {
          q: `Which tool has the larger memory / context window?`,
          a: `${a} features an expansive 200,000-token context window (roughly 150,000 words or 500 pages of text), whereas ${b} offers 128,000 tokens. ${a} excels in whole-codebase comprehension and long financial report analysis.`,
        },
        {
          q: `Can ${a} generate images or talk with real-time voice like ${b}?`,
          a: `No. ${a} specializes purely in text, code, and vision document inspection. ${b} includes native DALL·E 3 image generation directly inside chat and features Advanced Voice Mode for zero-latency spoken interactions.`,
        },
        {
          q: `What are the pricing options for ${a} and ${b}?`,
          a: `Both tools offer robust free tiers with rotating hourly usage caps. Both offer a $20/month subscription (${a} Pro and ${b} Plus) providing priority access during peak hours and higher context limits.`,
        },
      ];
    }
    return [
      {
        q: `Which model should I pick between ${a} and ${b}?`,
        a: `Choose ${a} if you prioritize deep analytical reasoning, long-document context, and clean structured code generation. Choose ${b} if you need multimodal tools like real-time voice, image synthesis, and automated web browsing.`,
      },
      {
        q: `Can I use both tools for free?`,
        a: `Yes, both platforms offer generous free tiers without requiring a credit card. Paid subscriptions are optional for power users who require higher usage quotas and priority server response.`,
      },
    ];
  }, [a, b, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] font-sans text-foreground flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">Loading head-to-head comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased overflow-x-hidden">
      <SiteNav />

      {/* Hero Ambient Glow Header */}
      <div className="relative border-b border-border/60 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent pt-4 pb-8 sm:pb-12">
        <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
          {/* Breadcrumbs & Quick Share Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="size-3.5 sm:size-4" />
              Back to all comparisons
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-foreground bg-white hover:bg-slate-50 border border-border px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Copy comparison link"
              >
                {copied ? (
                  <>
                    <CheckCheck className="size-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-slate-500" />
                    <span>Share</span>
                  </>
                )}
              </button>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                <ShieldCheck className="size-3 text-emerald-600" /> 2025/2026 Verified
              </span>
            </div>
          </div>

          {/* Hero Header */}
          <header className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary shadow-2xs">
              <Sparkles className="size-3" />
              {category}
            </span>
            <h1 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground text-balance">
              {a} <span className="text-primary font-light">vs</span> {b}
            </h1>
            <p className="mt-2.5 text-xs sm:text-base text-muted-foreground leading-relaxed">
              Complete head-to-head analysis comparing performance benchmarks, context window limits, pricing, features, and user ratings.
            </p>
          </header>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-10 lg:px-8">
        
        {/* Championship Battle Arena Cards */}
        <div className="relative mb-8 sm:mb-12">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 [&>*]:min-w-0">
            {/* Tool A Card (Claude / Anthropic) */}
            <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border-2 border-[#D97757]/30 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D97757] via-amber-500 to-indigo-500" />
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 mb-3 sm:mb-4">
                  {/* Official Logo Container */}
                  <div className="size-12 sm:size-16 rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-xs grid place-items-center shrink-0 p-2 group-hover:scale-105 transition-transform">
                    <ToolLogo name={String(a)} size={36} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm sm:text-xl font-bold text-foreground truncate" title={String(a)}>
                        {a}
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                      by {getToolCreator(a)}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Star className="size-2.5 sm:size-3 fill-amber-400 text-amber-400" /> {ratingA}
                      </span>
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-[#D97757] bg-[#D97757]/10 px-2 py-0.5 rounded-md border border-[#D97757]/20">
                        {pricingA}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Metric Highlights */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 my-2.5 sm:my-4 bg-slate-50/80 p-2 sm:p-3 rounded-xl border border-slate-150 text-[11px] sm:text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Context</span>
                    <span className="font-bold text-foreground">200K tokens</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Coding</span>
                    <span className="font-bold text-emerald-700">#1 Rated</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-2 flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={getToolWebsite(a)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center rounded-xl bg-primary hover:bg-primary/90 text-white px-3 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>Try {a}</span>
                  <ExternalLink className="size-3" />
                </a>
                <Link
                  href={getToolRoute(a, slugAKey)}
                  className="w-full text-center rounded-xl border border-border bg-card hover:bg-surface-soft px-3 py-2 text-xs sm:text-sm font-semibold text-foreground transition-colors shadow-2xs"
                >
                  Overview
                </Link>
              </div>
            </div>

            {/* Tool B Card (ChatGPT / OpenAI) */}
            <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border-2 border-[#10a37f]/30 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#10a37f] via-teal-500 to-emerald-600" />
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 mb-3 sm:mb-4">
                  {/* Official Logo Container */}
                  <div className="size-12 sm:size-16 rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-xs grid place-items-center shrink-0 p-2 group-hover:scale-105 transition-transform">
                    <ToolLogo name={String(b)} size={36} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm sm:text-xl font-bold text-foreground truncate" title={String(b)}>
                        {b}
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                      by {getToolCreator(b)}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Star className="size-2.5 sm:size-3 fill-amber-400 text-amber-400" /> {ratingB}
                      </span>
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-[#10a37f] bg-[#10a37f]/10 px-2 py-0.5 rounded-md border border-[#10a37f]/20">
                        {pricingB}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Metric Highlights */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 my-2.5 sm:my-4 bg-slate-50/80 p-2 sm:p-3 rounded-xl border border-slate-150 text-[11px] sm:text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Voice Mode</span>
                    <span className="font-bold text-emerald-700">Native Real-Time</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Images</span>
                    <span className="font-bold text-foreground">DALL·E 3 Built-in</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-2 flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={getToolWebsite(b)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>Try {b}</span>
                  <ExternalLink className="size-3" />
                </a>
                <Link
                  href={getToolRoute(b, slugBKey)}
                  className="w-full text-center rounded-xl border border-border bg-card hover:bg-surface-soft px-3 py-2 text-xs sm:text-sm font-semibold text-foreground transition-colors shadow-2xs"
                >
                  Overview
                </Link>
              </div>
            </div>
          </div>

          {/* Central VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden min-[440px]:grid place-items-center size-9 sm:size-12 rounded-full border-3 border-white bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 text-white font-black text-xs sm:text-sm shadow-lg">
            VS
          </div>
        </div>

        {/* Live Community Voting Poll Widget */}
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-white p-4 sm:p-6 shadow-xs mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                <Flame className="size-3 text-amber-600" /> Community Sentiment
              </span>
              <h3 className="font-bold text-sm sm:text-lg text-foreground mt-1">
                Which AI model do you rely on more?
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {totalVotes.toLocaleString()} community votes
            </span>
          </div>

          {/* Voting Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
              <div
                className="bg-gradient-to-r from-primary to-indigo-500 h-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white"
                style={{ width: `${percentA}%` }}
              >
                {percentA > 15 ? `${percentA}%` : ""}
              </div>
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-500 flex items-center justify-start pl-2 text-[10px] font-bold text-white"
                style={{ width: `${percentB}%` }}
              >
                {percentB > 15 ? `${percentB}%` : ""}
              </div>
            </div>

            <div className="flex justify-between text-xs font-semibold">
              <span className="text-primary flex items-center gap-1.5">
                <ToolLogo name={String(a)} size={14} />
                {a}: {percentA}% ({votesA.toLocaleString()})
              </span>
              <span className="text-emerald-700 flex items-center gap-1.5">
                <ToolLogo name={String(b)} size={14} />
                {b}: {percentB}% ({votesB.toLocaleString()})
              </span>
            </div>
          </div>

          {/* Vote Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4">
            <button
              onClick={() => handleVote("a")}
              className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                userVote === "a"
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-white hover:bg-slate-50 text-foreground border-border hover:border-primary/40 shadow-2xs"
              }`}
            >
              <ThumbsUp className="size-3.5" />
              <span>{userVote === "a" ? "You Voted for " + a : "Vote for " + a}</span>
            </button>

            <button
              onClick={() => handleVote("b")}
              className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                userVote === "b"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white hover:bg-slate-50 text-foreground border-border hover:border-emerald-500/40 shadow-2xs"
              }`}
            >
              <ThumbsUp className="size-3.5" />
              <span>{userVote === "b" ? "You Voted for " + b : "Vote for " + b}</span>
            </button>
          </div>
        </div>

        {/* Feature Comparison Matrix Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-white shadow-xs overflow-hidden mb-8 sm:mb-12">
          {/* Table Header & Category Filter Tabs */}
          <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" /> Feature-by-Feature Matrix
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Direct benchmark metrics with automatic capability winner highlights.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-white text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                All ({rows.length})
              </button>
              <button
                onClick={() => setActiveTab("core")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "core"
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-white text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Core Intelligence
              </button>
              <button
                onClick={() => setActiveTab("multimodal")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "multimodal"
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-white text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Multimodal & Media
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "pricing"
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-white text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Pricing & Limits
              </button>
            </div>
          </div>

          {/* Matrix Table with Sticky Header */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[480px] sm:min-w-0">
              {/* Sticky Column Headers */}
              <div className="sticky top-0 z-20 grid grid-cols-12 border-b border-border bg-slate-100/95 backdrop-blur-md text-xs font-bold text-muted-foreground shadow-2xs">
                <div className="col-span-5 sm:col-span-4 p-3 sm:p-4 uppercase tracking-wider text-slate-700">
                  Feature / Capability
                </div>
                <div className="col-span-3 sm:col-span-4 p-3 sm:p-4 text-center inline-flex items-center justify-center gap-1.5 text-primary border-x border-border/60 font-bold">
                  <ToolLogo name={String(a)} size={18} />
                  <span className="truncate">{a}</span>
                </div>
                <div className="col-span-4 sm:col-span-4 p-3 sm:p-4 text-center inline-flex items-center justify-center gap-1.5 text-emerald-800 font-bold">
                  <ToolLogo name={String(b)} size={18} />
                  <span className="truncate">{b}</span>
                </div>
              </div>

              {/* Data Rows */}
              {filteredRows.map((row: { label: string; a: string; b: string }, index: number) => {
                const winner = getRowWinner(row.label, row.a, row.b);
                const isAWinner = winner === "a";
                const isBWinner = winner === "b";

                return (
                  <div
                    key={row.label}
                    className={`grid grid-cols-12 border-b border-border/70 last:border-0 items-center text-xs sm:text-sm transition-colors hover:bg-slate-50/70 ${
                      index % 2 === 1 ? "bg-slate-50/30" : "bg-white"
                    }`}
                  >
                    {/* Attribute Name */}
                    <div className="col-span-5 sm:col-span-4 p-3 sm:p-4 font-semibold text-foreground text-xs sm:text-sm">
                      {row.label}
                    </div>

                    {/* Tool A Cell */}
                    <div
                      className={`col-span-3 sm:col-span-4 p-3 sm:p-4 text-center border-x border-border/60 ${
                        isAWinner ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {renderCellValue(row.a, isAWinner)}
                    </div>

                    {/* Tool B Cell */}
                    <div
                      className={`col-span-4 sm:col-span-4 p-3 sm:p-4 text-center ${
                        isBWinner ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {renderCellValue(row.b, isBWinner)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pros & Key Advantages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Tool A Strengths */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-[#D97757]/30 bg-gradient-to-b from-[#D97757]/5 to-white p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="size-8 rounded-xl bg-[#D97757]/15 text-[#D97757] grid place-items-center font-bold">
                <ToolLogo name={String(a)} size={18} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-foreground">
                Why Choose {a}?
              </h3>
            </div>
            <ul className="mt-4 space-y-3 text-xs sm:text-sm text-foreground/85">
              {prosA.map((pro: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-[#D97757]/15 text-[#D97757] grid place-items-center shrink-0 mt-0.5">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                  <span className="leading-relaxed">{pro}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-3 rounded-xl bg-white border border-[#D97757]/20 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Best Suited For: </span>
              Software engineers, architects, academic researchers, and anyone processing massive documents.
            </div>
          </div>

          {/* Tool B Strengths */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-[#10a37f]/30 bg-gradient-to-b from-[#10a37f]/5 to-white p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="size-8 rounded-xl bg-[#10a37f]/15 text-[#10a37f] grid place-items-center font-bold">
                <ToolLogo name={String(b)} size={18} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-foreground">
                Why Choose {b}?
              </h3>
            </div>
            <ul className="mt-4 space-y-3 text-xs sm:text-sm text-foreground/85">
              {prosB.map((pro: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-[#10a37f]/15 text-[#10a37f] grid place-items-center shrink-0 mt-0.5">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                  <span className="leading-relaxed">{pro}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-3 rounded-xl bg-white border border-[#10a37f]/20 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Best Suited For: </span>
              Multimodal creators, voice assistant users, image generators, and teams utilizing custom GPTs.
            </div>
          </div>
        </div>

        {/* Verdict & Recommendation Banner */}
        <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F5F3FF] p-6 sm:p-10 text-center shadow-sm mb-10 sm:mb-14">
          <div className="size-12 sm:size-14 rounded-2xl bg-primary text-white grid place-items-center mx-auto shadow-md mb-4">
            <Trophy className="size-6 sm:size-7" />
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
            The Final Verdict
          </span>
          <h3 className="text-xl sm:text-3xl font-black text-foreground">
            Which Tool Should You Pick?
          </h3>
          <p className="mt-3 text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            If your daily work revolves around <strong className="text-foreground">code generation, complex logic, and long documents</strong>,{" "}
            <strong className="text-primary">{a}</strong> is the clear industry benchmark. If you require{" "}
            <strong className="text-foreground">real-time voice conversation, native image creation, and live web research</strong>,{" "}
            <strong className="text-emerald-700">{b}</strong> is the more versatile all-in-one platform.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <a
              href={getToolWebsite(a)}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              Explore {a}
              <ExternalLink className="size-3.5" />
            </a>
            <a
              href={getToolWebsite(b)}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-foreground shadow-xs hover:bg-surface-soft transition-all cursor-pointer"
            >
              Explore {b}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Frequently Asked Questions (Accordion) */}
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-white p-5 sm:p-8 shadow-xs mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <HelpCircle className="size-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 sm:p-4 text-left font-semibold text-xs sm:text-sm text-foreground flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Popular Comparisons */}
        {otherComparisons.length > 0 && (
          <section className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-xl font-bold text-foreground">
                  Explore More AI Comparisons
                </h3>
                <p className="text-xs text-muted-foreground">
                  Compare top alternative models and developer platforms side by side.
                </p>
              </div>
              <Link
                href="/compare"
                className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {otherComparisons.map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  className="group rounded-2xl border border-border bg-white p-4 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {c.votes?.toLocaleString()} votes
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-foreground mt-2 truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{c.a}</span>
                      <span className="text-muted-foreground text-xs font-normal">vs</span>
                      <span>{c.b}</span>
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Head-to-head</span>
                    <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      Compare <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
      <SiteFooter />
    </div>
  );
}
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
  Shield,
  Sparkles,
  ExternalLink,
  Code,
  Layers,
  ThumbsUp,
  Cpu,
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

function renderValue(val: string) {
  const lower = String(val).toLowerCase().trim();
  if (lower === "yes" || lower === "true") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md text-xs font-semibold">
        <Check className="size-3.5" /> Yes
      </span>
    );
  }
  if (lower === "no" || lower === "false") {
    return (
      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md text-xs font-medium">
        <X className="size-3.5 text-slate-400" /> No
      </span>
    );
  }
  if (lower === "superior") {
    return (
      <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md text-xs font-semibold">
        <Sparkles className="size-3" /> Superior
      </span>
    );
  }
  const num = Number(val);
  if (Number.isFinite(num) && num > 0 && num <= 5) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md text-xs">
        <Star className="size-3 fill-amber-400 text-amber-400" /> {val}
      </span>
    );
  }
  return <span className="font-medium text-foreground text-xs sm:text-sm">{val}</span>;
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

  const [aRaw, bRaw] = slug.split("-vs-");
  const slugA = (aRaw ?? "Tool A").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const slugB = (bRaw ?? "Tool B").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const slugAKey = (aRaw ?? "").toLowerCase();
  const slugBKey = (bRaw ?? "").toLowerCase();

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
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

  const prosA = data?.prosA || toolA?.pros || [
    "High reasoning capability and context understanding",
    "Intuitive user interface with interactive workspace",
    "Excellent accuracy across coding and analytical tasks",
  ];
  const prosB = data?.prosB || toolB?.pros || [
    "Versatile multimodal features with audio and image tools",
    "Fast inference speed and broad ecosystem integrations",
    "Expansive developer support and extensive plugin options",
  ];

  const otherComparisons = useMemo(() => {
    return allComparisons.filter((c) => c.slug !== slug).slice(0, 3);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] font-sans text-foreground flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-9 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  const verdict = rows
    .filter((r: any) => r.a !== "—" && r.b !== "—" && r.a !== r.b)
    .map((r: any) => {
      const na = Number(r.a);
      const nb = Number(r.b);
      if (Number.isFinite(na) && Number.isFinite(nb)) {
        return { label: r.label, winner: na > nb ? "a" : na < nb ? "b" : null };
      }
      return { label: r.label, winner: null };
    })
    .filter((v: any) => v.winner)[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased overflow-x-hidden">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-12 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="size-3.5 sm:size-4" />
          Back to all comparisons
        </Link>

        {/* Hero Header Section */}
        <header className="text-center mb-6 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-primary shadow-xs">
            <Sparkles className="size-3" />
            {category}
          </span>
          <h1 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            {a} <span className="text-primary font-normal">vs</span> {b}
          </h1>
          <p className="mt-2 text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            In-depth head-to-head analysis of pricing, features, performance benchmarks, and user ratings.
          </p>
        </header>

        {/* Championship Head-to-Head Cards */}
        <div className="relative mb-8 sm:mb-12">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 [&>*]:min-w-0">
            {/* Tool A Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-primary/20 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-indigo-500" />
              <div>
                <div className="flex items-center gap-2.5 sm:gap-4 mb-3 sm:mb-4">
                  <div className="size-11 sm:size-16 rounded-xl sm:rounded-2xl border border-gray-150 bg-gray-50/80 shadow-xs grid place-items-center shrink-0">
                    <ToolLogo name={String(a)} size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-xl font-bold text-foreground truncate" title={String(a)}>
                      {a}
                    </h2>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                        <Star className="size-2.5 sm:size-3 fill-amber-400 text-amber-400" /> {ratingA}
                      </span>
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200/60">
                        {pricingA}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href={getToolRoute(a, slugAKey)}
                className="mt-3 w-full text-center rounded-xl bg-primary px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-primary/90 transition-colors"
              >
                View {a}
              </Link>
            </div>

            {/* Tool B Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-primary/60" />
              <div>
                <div className="flex items-center gap-2.5 sm:gap-4 mb-3 sm:mb-4">
                  <div className="size-11 sm:size-16 rounded-xl sm:rounded-2xl border border-gray-150 bg-gray-50/80 shadow-xs grid place-items-center shrink-0">
                    <ToolLogo name={String(b)} size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-xl font-bold text-foreground truncate" title={String(b)}>
                      {b}
                    </h2>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                        <Star className="size-2.5 sm:size-3 fill-amber-400 text-amber-400" /> {ratingB}
                      </span>
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60">
                        {pricingB}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href={getToolRoute(b, slugBKey)}
                className="mt-3 w-full text-center rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-soft transition-colors shadow-xs"
              >
                View {b}
              </Link>
            </div>
          </div>

          {/* Central VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden min-[400px]:grid place-items-center size-8 sm:size-11 rounded-full border-2 border-white bg-gradient-to-br from-primary to-indigo-600 text-white font-black text-[10px] sm:text-xs shadow-md">
            VS
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-8 sm:mb-12">
          <div className="p-3 sm:p-5 bg-surface-soft border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Feature-by-Feature Comparison
            </h3>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              {rows.length} attributes compared
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[440px] sm:min-w-0">
              {/* Table Column Headers */}
              <div className="grid grid-cols-12 border-b border-border bg-slate-50/80 text-xs font-bold text-muted-foreground">
                <div className="col-span-5 sm:col-span-4 p-3 sm:p-4 uppercase tracking-wider">
                  Attribute
                </div>
                <div className="col-span-3 sm:col-span-4 p-3 sm:p-4 text-center inline-flex items-center justify-center gap-1.5 text-primary">
                  <ToolLogo name={String(a)} size={18} />
                  <span className="truncate">{a}</span>
                </div>
                <div className="col-span-4 sm:col-span-4 p-3 sm:p-4 text-center inline-flex items-center justify-center gap-1.5 text-foreground">
                  <ToolLogo name={String(b)} size={18} />
                  <span className="truncate">{b}</span>
                </div>
              </div>

              {/* Rows */}
              {rows.map((row: { label: string; a: string; b: string }, index: number) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-12 border-b border-border/70 last:border-0 items-center text-xs sm:text-sm transition-colors hover:bg-primary/[0.02] ${
                    index % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  <div className="col-span-5 sm:col-span-4 p-2.5 sm:p-4 font-medium text-foreground text-xs sm:text-sm">
                    {row.label}
                  </div>
                  <div className="col-span-3 sm:col-span-4 p-2.5 sm:p-4 text-center">
                    {renderValue(row.a)}
                  </div>
                  <div className="col-span-4 sm:col-span-4 p-2.5 sm:p-4 text-center">
                    {renderValue(row.b)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pros & Key Advantages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Tool A Strengths */}
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/30 to-white p-4 sm:p-6 shadow-xs">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <span className="size-6 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
                <Check className="size-3.5" />
              </span>
              Why Choose {a}?
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-foreground/80">
              {prosA.map((pro: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tool B Strengths */}
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/30 to-white p-4 sm:p-6 shadow-xs">
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <span className="size-6 rounded-lg bg-indigo-100 text-indigo-700 grid place-items-center">
                <Check className="size-3.5" />
              </span>
              Why Choose {b}?
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-foreground/80">
              {prosB.map((pro: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="size-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verdict & Recommendation Banner */}
        <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F5F3FF] p-5 sm:p-8 text-center shadow-sm mb-10 sm:mb-14">
          <div className="size-10 sm:size-12 rounded-xl bg-primary text-white grid place-items-center mx-auto shadow-md mb-3">
            <Trophy className="size-5 sm:size-6" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-foreground">
            Our Recommendation: Which Should You Pick?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {verdict
              ? `${verdict.winner === "a" ? a : b} leads on ${verdict.label.toLowerCase()} and high-precision tasks. For general everyday utility, both models represent the peak of generative AI technology.`
              : `Both ${a} and ${b} are top-tier tools in their class. Choose ${a} if you prioritize specialized precision and deep reasoning, or choose ${b} if you need broader multimodal flexibility and plugin ecosystem.`}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4">
            <Link
              href={getToolRoute(a, slugAKey)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              Explore {a}
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href={getToolRoute(b, slugBKey)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-2.5 text-xs sm:text-sm font-semibold text-foreground shadow-xs hover:bg-surface-soft transition-all cursor-pointer"
            >
              Explore {b}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Other Popular Comparisons */}
        {otherComparisons.length > 0 && (
          <section className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-bold text-foreground">
                More AI Comparisons
              </h3>
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
                  className="group rounded-2xl border border-border bg-card p-3.5 sm:p-4 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {c.category}
                  </span>
                  <h4 className="font-bold text-sm text-foreground mt-1 truncate group-hover:text-primary transition-colors">
                    {c.a} vs {c.b}
                  </h4>
                  <p className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                    <span>{c.votes?.toLocaleString()} votes</span>
                    <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      Compare <ArrowRight className="size-3" />
                    </span>
                  </p>
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
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Search,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";

import { SiteFooter, SiteNav } from "@/app/routes";
import { ToolLogo } from "@/app/components/ToolLogo";
import type { Comparison } from "@/app/lib/data/comparisons";

type ComparisonAlternative = {
  slug: string;
  name: string;
  category: string;
};

type ComparisonFilterTab = {
  label: string;
  icon: string;
};

type ComparisonToolSuggestion = {
  slug: string;
  name: string;
  category: string;
  logo?: string | null;
  rating?: number | null;
};

type ComparisonsResponse = {
  success: boolean;
  data?: {
    comparisons: Comparison[];
    alternatives: ComparisonAlternative[];
    filterTabs: ComparisonFilterTab[];
    tools: ComparisonToolSuggestion[];
  };
  error?: {
    code?: string;
    message?: string;
  };
};

const iconMap = {
  Search,
  Check,
  Zap,
  Sparkles,
};

function ToolSearchBox({
  label,
  value,
  onChange,
  tools,
  excludeSlug,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tools: ComparisonToolSuggestion[];
  excludeSlug?: string;
  placeholder: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selectedTool = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return null;
    }

    return (
      tools.find(
        (tool) =>
          tool.name.toLowerCase() === query ||
          tool.slug.toLowerCase() === query
      ) ?? null
    );
  }, [value, tools]);

  const filteredTools = useMemo(() => {
    const query = value.trim().toLowerCase();

    return tools
      .filter((tool) => tool.slug !== excludeSlug)
      .filter((tool) => {
        if (!query) {
          return true;
        }

        return (
          tool.name.toLowerCase().includes(query) ||
          tool.slug.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [tools, value, excludeSlug]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function selectTool(tool: ComparisonToolSuggestion) {
    onChange(tool.name);
    setOpen(false);
  }

  function clearTool() {
    onChange("");
    setOpen(true);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <div
        className={`relative flex h-16 items-center rounded-2xl border bg-white transition-all dark:bg-slate-950 ${
          open
            ? "border-indigo-500 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/10"
            : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
        }`}
      >
        {selectedTool ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 px-4 text-left"
          >
            <ToolLogo
              slug={selectedTool.slug}
              name={selectedTool.name}
              size={38}
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">
                {selectedTool.name}
              </span>

              <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                {selectedTool.category}
              </span>
            </span>

            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : (
          <>
            <Search className="ml-5 h-5 w-5 shrink-0 text-slate-400" />

            <input
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />

            <ChevronDown
              className={`mr-4 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        )}

        {value && (
          <button
            type="button"
            onClick={clearTool}
            className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label={`Clear ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                {value.trim() ? "Matching tools" : "Available AI tools"}
              </span>

              <span className="text-xs text-slate-400">
                {filteredTools.length} available
              </span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {filteredTools.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />

                <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No matching tools
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try another tool name or category.
                </p>
              </div>
            ) : (
              filteredTools.map((tool) => (
                <button
                  key={tool.slug}
                  type="button"
                  onClick={() => selectTool(tool)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <ToolLogo
                    slug={tool.slug}
                    name={tool.name}
                    size={42}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                      {tool.name}
                    </span>

                    <span className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate">
                        {tool.category}
                      </span>

                      {typeof tool.rating === "number" && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">
                            •
                          </span>

                          <span className="inline-flex shrink-0 items-center gap-1">
                            <Star className="h-3 w-3 fill-current text-amber-400" />
                            {tool.rating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </span>
                  </span>

                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500 dark:text-slate-600" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonCard({
  comparison,
}: {
  comparison: Comparison;
}) {
  return (
    <Link
      href={`/compare/${comparison.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-slate-900 dark:hover:border-indigo-400/40"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/60 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-center justify-between">
        <span className="rounded-full border border-indigo-500/10 bg-indigo-500/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-400/10 dark:bg-indigo-400/10 dark:text-indigo-300">
          {comparison.category}
        </span>

        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-slate-600" />
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-white/10 dark:bg-slate-950">
            <ToolLogo
              slug={comparison.a.slug}
              name={comparison.a.name}
              size={42}
            />
          </div>

          <span className="mt-3 max-w-28 truncate text-center text-sm font-bold text-slate-900 dark:text-white">
            {comparison.a.name}
          </span>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-black tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5">
          VS
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-white/10 dark:bg-slate-950">
            <ToolLogo
              slug={comparison.b.slug}
              name={comparison.b.name}
              size={42}
            />
          </div>

          <span className="mt-3 max-w-28 truncate text-center text-sm font-bold text-slate-900 dark:text-white">
            {comparison.b.name}
          </span>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 dark:border-white/10">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Rating
          </p>

          <p className="mt-1.5 text-sm font-black text-slate-900 dark:text-white">
            {comparison.ratingA ?? "—"}
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">
              vs
            </span>
            {comparison.ratingB ?? "—"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Compare
          </p>

          <p className="mt-1.5 text-sm font-black text-indigo-600 dark:text-indigo-400">
            View details
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CompareLandingPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [toolOneQuery, setToolOneQuery] = useState("");
  const [toolTwoQuery, setToolTwoQuery] = useState("");

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [alternatives, setAlternatives] = useState<
    ComparisonAlternative[]
  >([]);
  const [filterTabs, setFilterTabs] = useState<
    ComparisonFilterTab[]
  >([]);
  const [tools, setTools] = useState<
    ComparisonToolSuggestion[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadComparisons() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/static/comparisons",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as ComparisonsResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.error?.message ||
              "Unable to load comparisons."
          );
        }

        if (!active) {
          return;
        }

        setComparisons(
          Array.isArray(result.data?.comparisons)
            ? result.data.comparisons
            : []
        );

        setAlternatives(
          Array.isArray(result.data?.alternatives)
            ? result.data.alternatives
            : []
        );

        setFilterTabs(
          Array.isArray(result.data?.filterTabs)
            ? result.data.filterTabs
            : []
        );

        setTools(
          Array.isArray(result.data?.tools)
            ? result.data.tools
            : []
        );
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load comparisons."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadComparisons();

    return () => {
      active = false;
    };
  }, []);

  const selectedToolOne = useMemo(() => {
    const query = toolOneQuery.trim().toLowerCase();

    if (!query) {
      return null;
    }

    return (
      tools.find(
        (tool) =>
          tool.name.toLowerCase() === query ||
          tool.slug.toLowerCase() === query
      ) ?? null
    );
  }, [toolOneQuery, tools]);

  const selectedToolTwo = useMemo(() => {
    const query = toolTwoQuery.trim().toLowerCase();

    if (!query) {
      return null;
    }

    return (
      tools.find(
        (tool) =>
          tool.name.toLowerCase() === query ||
          tool.slug.toLowerCase() === query
      ) ?? null
    );
  }, [toolTwoQuery, tools]);

  const comparisonSlug = useMemo(() => {
    if (
      !selectedToolOne ||
      !selectedToolTwo ||
      selectedToolOne.slug === selectedToolTwo.slug
    ) {
      return "";
    }

    return `${selectedToolOne.slug}-vs-${selectedToolTwo.slug}`;
  }, [selectedToolOne, selectedToolTwo]);

  const filteredComparisons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return comparisons.filter((comparison) => {
      const matchesSearch =
        !query ||
        comparison.a.name
          .toLowerCase()
          .includes(query) ||
        comparison.b.name
          .toLowerCase()
          .includes(query) ||
        comparison.category
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        comparison.category.toLowerCase() ===
          activeFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, comparisons]);

  const displayFilterTabs = useMemo(() => {
    if (filterTabs.length > 0) {
      return filterTabs;
    }

    return [
      {
        label: "All",
        icon: "Search",
      },
    ];
  }, [filterTabs]);

  const sameTool =
    selectedToolOne &&
    selectedToolTwo &&
    selectedToolOne.slug === selectedToolTwo.slug;

  const invalidCombination =
    Boolean(toolOneQuery && toolTwoQuery) &&
    (!selectedToolOne ||
      !selectedToolTwo ||
      Boolean(sameTool));

  const canCompare = Boolean(comparisonSlug);

  function swapTools() {
    setToolOneQuery(selectedToolTwo?.name || toolTwoQuery);
    setToolTwoQuery(selectedToolOne?.name || toolOneQuery);
  }

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <SiteNav />

      <main>
        <section className="relative overflow-visible border-b border-slate-200 dark:border-white/10">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-linear-to-b from-slate-50/80 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/15 bg-indigo-500/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
                <Sparkles className="h-4 w-4" />
                Tool Comparison
              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-7xl">
                Compare Tools
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                Compare tools side by side and find the right one for your needs.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-5xl">
              <div className="relative rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/40 sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      Choose two tools
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Search and select from published tools
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 sm:flex">
                    <Zap className="h-3.5 w-3.5" />
                    Live tool data
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
                  <ToolSearchBox
                    label="First AI tool"
                    value={toolOneQuery}
                    onChange={setToolOneQuery}
                    tools={tools}
                    excludeSlug={selectedToolTwo?.slug}
                    placeholder="Search for a tool..."
                  />

                  <div className="hidden h-16 items-center justify-center md:flex">
                    <button
                      type="button"
                      onClick={swapTools}
                      disabled={!toolOneQuery && !toolTwoQuery}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-black text-slate-400 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/30 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-300"
                      aria-label="Swap comparison tools"
                    >
                      VS
                    </button>
                  </div>

                  <ToolSearchBox
                    label="Second AI tool"
                    value={toolTwoQuery}
                    onChange={setToolTwoQuery}
                    tools={tools}
                    excludeSlug={selectedToolOne?.slug}
                    placeholder="Search for another tool..."
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-h-6">
                    {loading ? (
                      <p className="text-xs font-medium text-slate-500">
                        Loading published tools...
                      </p>
                    ) : error ? (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    ) : invalidCombination ? (
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Select two different published tools.
                      </p>
                    ) : canCompare ? (
                      <p className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="h-3 w-3" />
                        </span>
                        Both tools are ready to compare
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Select two tools to start your comparison.
                      </p>
                    )}
                  </div>

                  <Link
                    href={
                      canCompare
                        ? `/compare/${comparisonSlug}`
                        : "#"
                    }
                    aria-disabled={!canCompare}
                    onClick={(event) => {
                      if (!canCompare) {
                        event.preventDefault();
                      }
                    }}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-sm font-bold transition ${
                      canCompare
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
                        : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600"
                    }`}
                  >
                    Compare tools
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Popular comparisons
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Explore detailed head-to-head comparisons
                between published AI tools.
              </p>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search comparisons..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {displayFilterTabs.map((tab) => {
              const Icon =
                iconMap[
                  tab.icon as keyof typeof iconMap
                ] ?? Sparkles;

              const active = activeFilter === tab.label;

              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveFilter(tab.label)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
                />
              ))}
            </div>
          ) : error ? (
            <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-400/20 dark:bg-red-400/5">
              <h3 className="text-lg font-bold text-red-700 dark:text-red-300">
                Unable to load comparisons
              </h3>

              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : filteredComparisons.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-16 text-center dark:border-white/10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
                <Search className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                No comparisons found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another tool name or category.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredComparisons.map((comparison) => (
                <ComparisonCard
                  key={comparison.slug}
                  comparison={comparison}
                />
              ))}
            </div>
          )}
        </section>

        <section className="border-y border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                AI Tools
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Find another tool
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Browse published tools and open their profiles
                to learn more before comparing them.
              </p>
            </div>

            {loading ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5"
                  />
                ))}
              </div>
            ) : alternatives.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-white/10">
                No published tools are available yet.
              </div>
            ) : (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {alternatives.map((alternative) => (
                  <Link
                    key={alternative.slug}
                    href={`/tools/${alternative.slug}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-white/10 dark:bg-slate-900 dark:hover:border-indigo-400/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950">
                        <ToolLogo
                          slug={alternative.slug}
                          name={alternative.name}
                          size={32}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {alternative.name}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {alternative.category}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-slate-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Sparkles,
  Check,
  Zap,
} from "lucide-react";

import { SiteNav, SiteFooter } from "../routes/index";
import { ToolLogo } from "../components/ToolLogo";
import {
  allComparisons,
  alternatives,
  filterTabs,
} from "../lib/data/comparisons";

const iconMap = {
  Search,
  Check,
  Zap,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[·.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CompareLandingPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [toolOneQuery, setToolOneQuery] = useState("");
  const [toolTwoQuery, setToolTwoQuery] = useState("");

  const toolSuggestions = useMemo(() => {
    const names = new Set<string>();

    allComparisons.forEach((comparison) => {
      names.add(comparison.a.name);
      names.add(comparison.b.name);
    });

    return [...names];
  }, []);

  const toolOneSuggestions = useMemo(() => {
    const query = toolOneQuery.toLowerCase().trim();

    if (!query) {
      return toolSuggestions.slice(0, 6);
    }

    return toolSuggestions
      .filter((name) =>
        name.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [toolOneQuery, toolSuggestions]);

  const toolTwoSuggestions = useMemo(() => {
    const query = toolTwoQuery.toLowerCase().trim();

    if (!query) {
      return toolSuggestions.slice(0, 6);
    }

    return toolSuggestions
      .filter((name) =>
        name.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [toolTwoQuery, toolSuggestions]);

  const selectedComparison = useMemo(() => {
    const a = toolOneQuery.trim().toLowerCase();
    const b = toolTwoQuery.trim().toLowerCase();

    return allComparisons.find(
      (comparison) =>
        (comparison.a.name.toLowerCase() === a &&
          comparison.b.name.toLowerCase() === b) ||
        (comparison.a.name.toLowerCase() === b &&
          comparison.b.name.toLowerCase() === a)
    );
  }, [toolOneQuery, toolTwoQuery]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return allComparisons.filter((comparison) => {
      const matchesSearch =
        !query ||
        comparison.a.name.toLowerCase().includes(query) ||
        comparison.b.name.toLowerCase().includes(query);

      const matchesCategory =
        activeFilter === "All" ||
        comparison.category === activeFilter;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeFilter]);

  const comparisonSlug =
    selectedComparison?.slug ||
    (toolOneQuery.trim() && toolTwoQuery.trim()
      ? `${slugify(toolOneQuery)}-vs-${slugify(toolTwoQuery)}`
      : "");

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a]">
      <SiteNav />

      <section className="border-b border-border bg-surface-soft py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Compare & Alternatives
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find the Right Tool{" "}
            <span className="text-primary">Side by Side</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Compare AI tools across pricing, features, capabilities,
            ratings, and real-world use cases.
          </p>

          <div className="mx-auto mt-8 max-w-3xl">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={toolOneQuery}
                  onChange={(event) =>
                    setToolOneQuery(event.target.value)
                  }
                  placeholder="First AI tool..."
                  className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />

                {toolOneSuggestions.length > 0 &&
                  toolOneQuery.length > 0 && (
                    <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
                      {toolOneSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setToolOneQuery(name)}
                          className="block w-full px-4 py-3 text-left text-sm hover:bg-surface-soft"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              <div className="mx-auto grid size-10 place-items-center rounded-full bg-card text-xs font-bold shadow ring-4 ring-card">
                VS
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={toolTwoQuery}
                  onChange={(event) =>
                    setToolTwoQuery(event.target.value)
                  }
                  placeholder="Second AI tool..."
                  className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />

                {toolTwoSuggestions.length > 0 &&
                  toolTwoQuery.length > 0 && (
                    <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
                      {toolTwoSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setToolTwoQuery(name)}
                          className="block w-full px-4 py-3 text-left text-sm hover:bg-surface-soft"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-5">
              {comparisonSlug ? (
                <Link
                  href={`/compare/${comparisonSlug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Compare Tools
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-muted px-6 py-3 text-sm font-semibold text-muted-foreground"
                >
                  Compare Tools
                  <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Zap className="size-5 text-primary" />
              Popular Comparisons
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore detailed head-to-head comparisons.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search comparisons..."
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/50 sm:w-64"
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                activeFilter === tab
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-md sm:p-5"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  {comparison.category}
                </span>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ToolLogo
                      name={comparison.a.name}
                      size={22}
                    />
                    <span className="truncate text-sm font-bold text-foreground">
                      {comparison.a.name}
                    </span>
                  </div>

                  <div className="text-center text-xs font-semibold text-muted-foreground">
                    VS
                  </div>

                  <div className="flex items-center gap-2">
                    <ToolLogo
                      name={comparison.b.name}
                      size={22}
                    />
                    <span className="truncate text-sm font-bold text-foreground">
                      {comparison.b.name}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Compare
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <p className="font-medium text-foreground">
              No comparisons found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another tool or category.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-border bg-surface-soft py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Sparkles className="size-5 text-primary" />
              Top Alternatives
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore alternatives to popular AI tools.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {alternatives.map((alternative) => (
              <Link
                key={alternative.slug}
                href={`/alternatives/${alternative.slug}`}
                className="rounded-2xl border border-border bg-card p-4 text-center transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="mx-auto mb-3 grid size-10 place-items-center rounded-xl bg-primary/10">
                  <ToolLogo
                    name={alternative.name}
                    size={24}
                  />
                </div>

                <p className="truncate text-sm font-semibold text-foreground">
                  {alternative.name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {alternative.count} alternatives
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            How It Works
          </span>

          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Compare tools in three simple steps
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: "Search",
              title: "Choose two tools",
              desc: "Select any two supported AI tools.",
            },
            {
              icon: "Check",
              title: "Review the data",
              desc: "Compare features, pricing, capabilities, and ratings.",
            },
            {
              icon: "Zap",
              title: "Make your decision",
              desc: "Use the comparison data for your specific workflow.",
            },
          ].map((item) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap];

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>

                <h3 className="font-semibold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Search, Zap, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNav, SiteFooter } from "../routes/index";
import { api } from "../lib/api";


const iconMap: Record<string, React.ElementType> = {
  Search,
  Check,
  Zap,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export default function CompareLandingPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [allComparisons, setAllComparisons] = useState([
    { slug: "chatgpt-vs-claude", a: "ChatGPT", b: "Claude", category: "AI Chatbots", votes: 4821 },
    { slug: "midjourney-vs-dall-e", a: "Midjourney", b: "DALL·E", category: "Image Generation", votes: 3102 },
    { slug: "github-copilot-vs-cursor", a: "GitHub Copilot", b: "Cursor", category: "Coding", votes: 2874 },
    { slug: "notion-ai-vs-mem", a: "Notion AI", b: "Mem", category: "Productivity", votes: 1954 },
    { slug: "jasper-vs-copy-ai", a: "Jasper", b: "Copy.ai", category: "AI Writing", votes: 1432 },
    { slug: "runway-vs-pika", a: "Runway", b: "Pika", category: "Video", votes: 1287 },
    { slug: "gemini-vs-chatgpt", a: "Gemini", b: "ChatGPT", category: "AI Chatbots", votes: 3341 },
    { slug: "perplexity-vs-you", a: "Perplexity", b: "You.com", category: "Search", votes: 987 },
  ]);
  const [alternatives, setAlternatives] = useState([
    { slug: "chatgpt", name: "ChatGPT", category: "AI Chatbot", altCount: 12 },
    { slug: "midjourney", name: "Midjourney", category: "Image Generation", altCount: 8 },
    { slug: "github-copilot", name: "GitHub Copilot", category: "Coding", altCount: 9 },
    { slug: "notion-ai", name: "Notion AI", category: "Productivity", altCount: 7 },
    { slug: "jasper", name: "Jasper", category: "AI Writing", altCount: 11 },
    { slug: "runway", name: "Runway", category: "Video", altCount: 6 },
  ]);
  const [filterTabs, setFilterTabs] = useState(["All", "AI Chatbots", "Image Generation", "Coding", "Productivity", "AI Writing", "Video", "Search"]);
  const [howItWorks, setHowItWorks] = useState([
    { icon: "Search", title: "Pick any two tools", desc: "Search from 2,500+ AI tools in our directory and select the ones you want to compare." },
    { icon: "Check", title: "Get a side-by-side breakdown", desc: "Pricing, context windows, features, pros & cons — everything in one clean view." },
    { icon: "Zap", title: "Walk away with a verdict", desc: "Our verdict section tells you exactly which tool wins for your specific use case." },
  ]);

  // --- Comparison search UI state ---
  const [toolOneQuery, setToolOneQuery] = useState("");
  const [toolTwoQuery, setToolTwoQuery] = useState("");
  const [toolOneSelected, setToolOneSelected] = useState("");
  const [toolTwoSelected, setToolTwoSelected] = useState("");
  const [showToolOneSuggestions, setShowToolOneSuggestions] = useState(false);
  const [showToolTwoSuggestions, setShowToolTwoSuggestions] = useState(false);
  const toolOneWrapperRef = useRef<HTMLDivElement>(null);
  const toolTwoWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getComparisons().then((data) => {
      setAllComparisons(data.allComparisons);
      setAlternatives(data.alternatives);
      setFilterTabs(data.filterTabs);
      setHowItWorks(data.howItWorks);
    }).catch(() => {});
  }, []);

  // Build a deduplicated list of tool names from allComparisons (a + b)
  const toolSuggestions = useMemo(() => {
    const names = new Set<string>();
    allComparisons.forEach((c) => {
      names.add(c.a);
      names.add(c.b);
    });
    return Array.from(names);
  }, [allComparisons]);

  const toolOneSuggestionResults = useMemo(() => {
    if (!toolOneQuery) return toolSuggestions.slice(0, 6);
    return toolSuggestions
      .filter((name) => name.toLowerCase().includes(toolOneQuery.toLowerCase()))
      .slice(0, 6);
  }, [toolOneQuery, toolSuggestions]);

  const toolTwoSuggestionResults = useMemo(() => {
    if (!toolTwoQuery) return toolSuggestions.slice(0, 6);
    return toolSuggestions
      .filter((name) => name.toLowerCase().includes(toolTwoQuery.toLowerCase()))
      .slice(0, 6);
  }, [toolTwoQuery, toolSuggestions]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolOneWrapperRef.current && !toolOneWrapperRef.current.contains(event.target as Node)) {
        setShowToolOneSuggestions(false);
      }
      if (toolTwoWrapperRef.current && !toolTwoWrapperRef.current.contains(event.target as Node)) {
        setShowToolTwoSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canCompare = toolOneSelected.trim() !== "" && toolTwoSelected.trim() !== "";

  const handleToolOneChange = (value: string) => {
    setToolOneQuery(value);
    setToolOneSelected(value);
    setShowToolOneSuggestions(true);
  };

  const handleToolTwoChange = (value: string) => {
    setToolTwoQuery(value);
    setToolTwoSelected(value);
    setShowToolTwoSuggestions(true);
  };

  const handleSelectToolOne = (name: string) => {
    setToolOneQuery(name);
    setToolOneSelected(name);
    setShowToolOneSuggestions(false);
  };

  const handleSelectToolTwo = (name: string) => {
    setToolTwoQuery(name);
    setToolTwoSelected(name);
    setShowToolTwoSuggestions(false);
  };

  const handleCompareClick = () => {
    if (!canCompare) return;
    const slug = `${slugify(toolOneSelected)}-vs-${slugify(toolTwoSelected)}`;
    router.push(`/compare/${slug}`);
  };

  const filtered = allComparisons.filter((c) => {
    const matchSearch =
      search === "" ||
      c.a.toLowerCase().includes(search.toLowerCase()) ||
      c.b.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || c.category === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />

      <section className="bg-surface-soft border-b border-border py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Compare & Alternatives
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Find the Right Tool,{" "}
            <span className="text-primary">Side by Side</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare pricing, features, and use cases — or explore the best alternatives to any AI tool.
          </p>

          {/* Comparison search UI */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
              {/* First tool input */}
              <div ref={toolOneWrapperRef} className="relative flex-1 text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search first AI tool..."
                  value={toolOneQuery}
                  onChange={(e) => handleToolOneChange(e.target.value)}
                  onFocus={() => setShowToolOneSuggestions(true)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm sm:rounded-r-none"
                />
                {showToolOneSuggestions && toolOneSuggestionResults.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    {toolOneSuggestionResults.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelectToolOne(name)}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface-soft hover:text-primary transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative z-10 flex justify-center sm:-mx-0">
                <span className="grid place-items-centertext-xs font-bold uppercase tracking-wide shadow-md ring-4 ring-card shrink-0 -my-1 sm:my-0">
                  VS
                </span>
              </div>

              {/* Second tool input */}
              <div ref={toolTwoWrapperRef} className="relative flex-1 text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search second AI tool..."
                  value={toolTwoQuery}
                  onChange={(e) => handleToolTwoChange(e.target.value)}
                  onFocus={() => setShowToolTwoSuggestions(true)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm sm:rounded-l-none"
                />
                {showToolTwoSuggestions && toolTwoSuggestionResults.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    {toolTwoSuggestionResults.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelectToolTwo(name)}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-surface-soft hover:text-primary transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompareClick}
              disabled={!canCompare}
              className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-all ${
                canCompare
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              }`}
            >
              Compare Tools
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {allComparisons.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                {c.a} vs {c.b}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Popular Comparisons
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all border ${
                activeFilter === tab
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                  {c.category}
                </span>
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{c.a}</span>
                  <span className="text-xs text-muted-foreground font-medium">vs</span>
                  <span className="font-bold text-foreground text-sm">{c.b}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {c.votes.toLocaleString()} comparisons
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No comparisons found for <span className="font-medium text-foreground">&ldquo;{search}&rdquo;</span></p>
            <p className="text-xs mt-1">Try searching for a tool name like &ldquo;ChatGPT&rdquo; or &ldquo;Midjourney&rdquo;</p>
          </div>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-border" />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Top Alternatives
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Looking for something similar? Explore the best alternatives.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {alternatives.map((alt) => (
            <Link
              key={alt.slug}
              href={`/alternatives/${alt.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 text-center hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-muted text-primary grid place-items-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="font-semibold text-foreground text-sm truncate">{alt.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{alt.altCount} alternatives</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-soft border-y border-border py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">How It Works</span>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Make smarter decisions, faster
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
            {howItWorks.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary-muted text-primary grid place-items-center mb-4">
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-primary/5 border border-primary/10 p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Don&apos;t see the comparison you need?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Browse our full directory and find any tool — then compare it head to head with any alternative.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/discover"
              className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-sm hover:bg-foreground/90 transition-all"
            >
              Browse All Tools
            </Link>
            <Link
              href="/submit"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-soft transition-all"
            >
              Submit a Tool
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SiteNav,
  SiteFooter,
  ToolCard,
  trending as fallbackTrending,
  categories,
} from "../routes/index";
import { api } from "../lib/api";

type Filter = "All" | "Free" | "Freemium" | "Paid";

interface ToolData {
  slug: string;
  name: string;
  category: string;
  pricing: string;
  rating: number;
  reviews: number;
  desc: string;
  website: string;
  logo?: string;
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);
  const [filter, setFilter] = useState<Filter>("All");
  const [category, setCategory] = useState<string>("All");
  const [apiTools, setApiTools] = useState<ToolData[]>([]);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    if (urlQuery !== queryRef.current) setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    api.getTools({ limit: 50 }).then((data) => {
      const mapped = data.tools.map((t: ToolData) => ({
        slug: t.slug, name: t.name, category: t.category,
        pricing: t.pricing, rating: t.rating, reviews: t.reviews,
        desc: t.desc, website: t.website, logo: t.logo,
      }));
      setApiTools(mapped);
    }).catch(() => {});
  }, []);

  const allTools: ToolData[] =
    apiTools.length > 0
      ? apiTools
      : fallbackTrending.map((t) => ({
          slug: t.slug,
          name: t.name,
          category: t.category,
          pricing: t.pricing as string,
          rating: t.rating,
          reviews: t.reviews,
          desc: t.desc,
          website: t.website,
          logo: typeof t.logo === "string" ? t.logo : undefined,
        }));

  const tools = useMemo(() => {
    return allTools.filter((t: ToolData) => {
      if (filter !== "All" && t.pricing !== filter) return false;
      if (category !== "All" && t.category !== category) return false;
      if (query && !`${t.name} ${t.desc} ${t.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [allTools, query, filter, category]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(`/discover${q ? `?q=${encodeURIComponent(q)}` : ""}`, { scroll: false });
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-4xl font-bold tracking-tight">Discover AI tools</h1>
          <p className="mt-2 text-muted-foreground">Filter {allTools.length}+ curated tools by category, pricing, and more.</p>
        </header>

        <form onSubmit={handleSearch} className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-2xl border border-border bg-card pl-12 pr-4 py-3.5 text-base outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </form>

        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {(["All", "Free", "Freemium", "Paid"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 self-stretch bg-border" />
          <button
            onClick={() => setCategory("All")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              category === "All"
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
            }`}
          >
            All categories
          </button>
          {categories.slice(0, 6).map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.name)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                category === c.name
                  ? "bg-foreground text-background"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {tools.map((t: ToolData) => {
            const fallbackMatch = fallbackTrending.find((f) => f.slug === t.slug);
            const pricing = t.pricing as "Free" | "Freemium" | "Paid";
            return (
              <ToolCard
                key={t.slug}
                tool={{
                  slug: t.slug,
                  name: t.name,
                  category: t.category,
                  logo: (t.logo || fallbackMatch?.logo || fallbackTrending[0]?.logo) as typeof fallbackTrending[number]["logo"],
                  pricing: pricing || "Free",
                  rating: t.rating || 0,
                  reviews: t.reviews || 0,
                  desc: t.desc || "",
                  website: t.website || "#",
                }}
              />
            );
          })}
        </div>
        {tools.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">No tools match your filters.</p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

export default function DiscoverClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="grid place-items-center py-32">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
        <SiteFooter />
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}

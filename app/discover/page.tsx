"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Filter as FilterIcon, ChevronDown, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SiteNav,
  SiteFooter,
  ToolCard,
  trending as fallbackTrending,
  categories as fallbackCategories,
} from "../routes/index";
import { api } from "../lib/api";

type PricingFilter = "All" | "Free" | "Freemium" | "Paid";
type SortOption = "trending" | "popular" | "newest" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
];

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
  upvotes?: number;
  clicks?: number;
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get("q") || "";
  const urlSort = (searchParams.get("sort") as SortOption) || "trending";
  const urlPricing = searchParams.get("pricing") || "All";
  const urlCategory = searchParams.get("category") || "All";

  const [query, setQuery] = useState(urlQuery);
  const [sort, setSort] = useState<SortOption>(urlSort);
  const [pricing, setPricing] = useState<PricingFilter>(urlPricing as PricingFilter);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategory ? urlCategory.split(",").filter(Boolean) : []
  );
  const [apiTools, setApiTools] = useState<ToolData[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    if (urlQuery !== queryRef.current) setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    api.getTools({ limit: 100, sort: "trending" }).then((data) => {
      const mapped = data.tools.map((t: any) => ({
        slug: t.slug,
        name: t.name,
        category: t.category,
        pricing: t.pricing,
        rating: t.rating,
        reviews: t.reviews,
        desc: t.desc,
        website: t.website,
        logo: t.logo,
        upvotes: t.upvotes,
        clicks: t.clicks,
      }));
      setApiTools(mapped);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.getCategories().then((data) => {
      if (data && data.length > 0) {
        setCategoriesLoaded(data.map((c: any) => c.name));
      }
    }).catch(() => {});
  }, []);

  const allCategories = useMemo(() => {
    if (categoriesLoaded.length > 0) return categoriesLoaded;
    return fallbackCategories.map((c) => c.name);
  }, [categoriesLoaded]);

const allTools: ToolData[] = useMemo(() => {
    if (apiTools.length === 0)
      return fallbackTrending.map((t) => ({
        slug: t.slug,
        name: t.name,
        category: t.category,
        pricing: t.pricing as string,
        rating: t.rating,
        reviews: t.reviews,
        desc: t.desc,
        website: t.website,
        logo: typeof t.logo === "string" ? t.logo : undefined,
        upvotes: 0,
        clicks: 0,
      }));
    return apiTools;
  }, [apiTools]);

  const filteredTools = useMemo(() => {
    let result = allTools;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((t) =>
        `${t.name} ${t.desc} ${t.category}`.toLowerCase().includes(q)
      );
    }

    if (pricing !== "All") {
      result = result.filter((t) => t.pricing === pricing);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((t) => selectedCategories.includes(t.category));
    }

    switch (sort) {
      case "popular":
        result = [...result].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0) || (b.clicks || 0) - (a.clicks || 0) || b.rating - a.rating);
        break;
      case "newest":
        result = [...result].sort((a, b) => 0); // fallback - no date in static data
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case "trending":
      default:
        result = [...result].sort((a, b) =>
          (b.upvotes || 0) - (a.upvotes || 0) || (b.clicks || 0) - (a.clicks || 0) || b.rating - a.rating
        );
        break;
    }

    return result;
  }, [allTools, query, pricing, selectedCategories, sort]);

  function updateUrl() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sort !== "trending") params.set("sort", sort);
    if (pricing !== "All") params.set("pricing", pricing);
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    router.push(`/discover${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateUrl();
  }

  function handleSortChange(newSort: SortOption) {
    setSort(newSort);
    updateUrl();
  }

  function handlePricingChange(newPricing: PricingFilter) {
    setPricing(newPricing);
    updateUrl();
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function clearAllFilters() {
    setQuery("");
    setSort("trending");
    setPricing("All");
    setSelectedCategories([]);
    router.push("/discover", { scroll: false });
  }

  const hasActiveFilters = query || sort !== "trending" || pricing !== "All" || selectedCategories.length > 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Filters */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:border-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Filters"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-muted"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Search Tools</label>
              <form onSubmit={handleSearch} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </form>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Sort</label>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none bg-no-repeat bg-right-3 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Pricing</label>
              <div className="space-y-2">
                {(["All", "Free", "Freemium", "Paid"] as PricingFilter[]).map((f) => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pricing"
                      value={f}
                      checked={pricing === f}
                      onChange={() => handlePricingChange(f)}
                      className="h-4 w-4 text-primary border-border focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-muted-foreground">Categories</label>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {allCategories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <span className="text-sm text-foreground truncate">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-0 flex-1">
        {/* Top Bar: Search + Sort (Desktop) / Filter Toggle (Mobile) */}
        <div className="sticky top-16 z-30 md:top-0 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xl md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              />
            </form>

            {/* Sort + Filter Toggle */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown - Desktop */}
              <div className="hidden md:block">
                <label className="sr-only">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none bg-no-repeat bg-right-3 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Filter Sidebar Toggle - Mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/30 hover:text-primary"
              >
                <FilterIcon className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {selectedCategories.length + (pricing !== "All" ? 1 : 0) + (query ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Discover AI tools</h1>
              <p className="mt-1 text-muted-foreground">
                {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
                {hasActiveFilters && (
                  <span className="ml-2 text-primary font-medium">(filtered)</span>
                )}
              </p>
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {query && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    <Search className="h-3 w-3" />
                    "{query}"
                    <button onClick={() => { setQuery(""); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {pricing !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {pricing}
                    <button onClick={() => { handlePricingChange("All"); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-8">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((t) => {
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
                      upvotes: t.upvotes,
                      clicks: t.clicks,
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No tools found</h3>
              <p className="mt-1 text-muted-foreground">Try adjusting your filters or search terms</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 rounded-xl border border-primary bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function DiscoverClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5]">
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
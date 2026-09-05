"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Filter as FilterIcon, ChevronRight, ChevronDown } from "lucide-react";
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

const PRICING_OPTIONS: { value: PricingFilter; label: string }[] = [
  { value: "All", label: "All Pricing" },
  { value: "Free", label: "Free" },
  { value: "Freemium", label: "Freemium" },
  { value: "Paid", label: "Paid" },
];

const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 4.5, label: "4.5+" },
  { value: 4, label: "4+" },
  { value: 3.5, label: "3.5+" },
  { value: 3, label: "3+" },
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
  trendScore?: number;
  createdAt?: string;
  freePlan?: boolean;
  freeTrial?: boolean;
  apiAvailable?: boolean;
  aiPowered?: boolean;
  platforms?: string[];
  integrations?: string[];
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get("q") || "";
  const urlSort = (searchParams.get("sort") as SortOption) || "trending";
  const urlPricing = searchParams.get("pricing") || "All";
  const urlCategory = searchParams.get("category") || "All";
  const urlFreePlan = searchParams.get("freePlan") === "true";
  const urlFreeTrial = searchParams.get("freeTrial") === "true";
  const urlApiAvailable = searchParams.get("apiAvailable") === "true";
  const urlAiPowered = searchParams.get("aiPowered") === "true";
  const urlMinRating = Number(searchParams.get("rating")) || 0;
  const urlPlatforms = searchParams.get("platforms") || "";
  const urlIntegrations = searchParams.get("integrations") || "";

  const [query, setQuery] = useState(urlQuery);
  const [sort, setSort] = useState<SortOption>(urlSort);
  const [pricing, setPricing] = useState<PricingFilter>(urlPricing as PricingFilter);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategory ? urlCategory.split(",").filter(Boolean) : []
  );
  const [freePlan, setFreePlan] = useState(urlFreePlan);
  const [freeTrial, setFreeTrial] = useState(urlFreeTrial);
  const [apiAvailable, setApiAvailable] = useState(urlApiAvailable);
  const [aiPowered, setAiPowered] = useState(urlAiPowered);
  const [minRating, setMinRating] = useState<number>(urlMinRating);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    urlPlatforms ? urlPlatforms.split(",").filter(Boolean) : []
  );
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    urlIntegrations ? urlIntegrations.split(",").filter(Boolean) : []
  );
  const [apiTools, setApiTools] = useState<ToolData[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    if (urlQuery !== queryRef.current) setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    api.getTools({ limit: 200, sort: "trending" }).then((data) => {
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
        trendScore: t.trendScore,
        createdAt: t.createdAt,
        freePlan: Boolean(t.freePlan),
        freeTrial: Boolean(t.freeTrial),
        apiAvailable: Boolean(t.compare?.apiAvailable),
        aiPowered: Boolean(t.compare?.aiPowered),
        platforms: (t.compare?.platforms || []).map(String),
        integrations: (t.compare?.integrations || []).map(String),
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
        trendScore: 0,
        freePlan: false,
        freeTrial: false,
        apiAvailable: false,
        aiPowered: false,
        platforms: [],
        integrations: [],
      }));
    return apiTools;
  }, [apiTools]);

  // Dynamic filter options derived from the loaded tools (database-driven).
  const platformOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of allTools) for (const p of t.platforms || []) if (p) set.add(p);
    return [...set].sort();
  }, [allTools]);

  const integrationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of allTools) for (const i of t.integrations || []) if (i) set.add(i);
    return [...set].sort();
  }, [allTools]);

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

    if (freePlan) result = result.filter((t) => t.freePlan);
    if (freeTrial) result = result.filter((t) => t.freeTrial);
    if (apiAvailable) result = result.filter((t) => t.apiAvailable);
    if (aiPowered) result = result.filter((t) => t.aiPowered);
    if (minRating > 0) result = result.filter((t) => t.rating >= minRating);
    if (selectedPlatforms.length > 0) {
      result = result.filter((t) =>
        (t.platforms || []).some((p) => selectedPlatforms.includes(p))
      );
    }
    if (selectedIntegrations.length > 0) {
      result = result.filter((t) =>
        (t.integrations || []).some((i) => selectedIntegrations.includes(i))
      );
    }

    switch (sort) {
      case "popular":
        result = [...result].sort(
          (a, b) =>
            (b.upvotes || 0) - (a.upvotes || 0) ||
            (b.clicks || 0) - (a.clicks || 0) ||
            b.rating - a.rating
        );
        break;
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case "trending":
      default:
        // Backend-computed organic trend score: recent views, clicks, votes,
        // ratings and recent growth. Never manually selected.
        result = [...result].sort(
          (a, b) =>
            (b.trendScore || 0) - (a.trendScore || 0) ||
            (b.upvotes || 0) - (a.upvotes || 0) ||
            (b.clicks || 0) - (a.clicks || 0) ||
            b.rating - a.rating
        );
        break;
    }

    return result;
  }, [
    allTools,
    query,
    pricing,
    selectedCategories,
    sort,
    freePlan,
    freeTrial,
    apiAvailable,
    aiPowered,
    minRating,
    selectedPlatforms,
    selectedIntegrations,
  ]);

  function updateUrl() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sort !== "trending") params.set("sort", sort);
    if (pricing !== "All") params.set("pricing", pricing);
    if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
    if (freePlan) params.set("freePlan", "true");
    if (freeTrial) params.set("freeTrial", "true");
    if (apiAvailable) params.set("apiAvailable", "true");
    if (aiPowered) params.set("aiPowered", "true");
    if (minRating > 0) params.set("rating", String(minRating));
    if (selectedPlatforms.length > 0) params.set("platforms", selectedPlatforms.join(","));
    if (selectedIntegrations.length > 0) params.set("integrations", selectedIntegrations.join(","));
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
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      const idx = allCategories.indexOf(cat);
      if (idx >= 6 && !prev.includes(cat)) setShowMoreCategories(true);
      return next;
    });
  }

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function toggleIntegration(i: string) {
    setSelectedIntegrations((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  function clearAllFilters() {
    setQuery("");
    setSort("trending");
    setPricing("All");
    setSelectedCategories([]);
    setFreePlan(false);
    setFreeTrial(false);
    setApiAvailable(false);
    setAiPowered(false);
    setMinRating(0);
    setSelectedPlatforms([]);
    setSelectedIntegrations([]);
    router.push("/discover", { scroll: false });
  }

  const filterCount =
    (query ? 1 : 0) +
    (pricing !== "All" ? 1 : 0) +
    selectedCategories.length +
    (minRating > 0 ? 1 : 0) +
    selectedPlatforms.length +
    selectedIntegrations.length +
    (freePlan ? 1 : 0) +
    (freeTrial ? 1 : 0) +
    (apiAvailable ? 1 : 0) +
    (aiPowered ? 1 : 0);

  const hasActiveFilters =
    filterCount > 0 ||
    sort !== "trending" ||
    query.length > 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased overflow-x-hidden">
      <SiteNav />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="md:flex md:items-start">
      {/* Sidebar - Filters */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(20rem,88vw)] bg-white border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out md:sticky md:top-16 md:z-20 md:h-[calc(100dvh-4rem)] md:w-72 md:shrink-0 md:translate-x-0 md:shadow-none md:self-start ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        aria-label="Filters"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FilterIcon className="size-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">Filters</h2>
              {filterCount > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold">
                  {filterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Reset all
                </button>
              )}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted md:hidden"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
              <select
                value={pricing}
                onChange={(e) => handlePricingChange(e.target.value as PricingFilter)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none bg-no-repeat bg-right-3 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')]"
              >
                {PRICING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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
              <div className="space-y-1.5">
                {allCategories.slice(0, 6).map((cat) => (
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
                {showMoreCategories && (
                  <div className="space-y-1.5 pt-1">
                    {allCategories.slice(6).map((cat) => (
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
                )}
              </div>
              {allCategories.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowMoreCategories((v) => !v)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline pt-1"
                >
                  {showMoreCategories ? "Less categories" : `More categories (${allCategories.length - 6})`}
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showMoreCategories ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>

            {/* More Filters */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowMoreFilters((v) => !v)}
                className="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground"
              >
                <span>More Filters</span>
                <span className="flex items-center gap-2">
                  {filterCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{filterCount}</span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showMoreFilters ? "rotate-180" : ""}`} />
                </span>
              </button>

              {showMoreFilters && (
                <div className="mt-3 space-y-4">
                  {/* Boolean toggles */}
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: "freePlan", label: "Free Plan", value: freePlan, set: setFreePlan },
                      { key: "freeTrial", label: "Free Trial", value: freeTrial, set: setFreeTrial },
                      { key: "apiAvailable", label: "API Available", value: apiAvailable, set: setApiAvailable },
                      { key: "aiPowered", label: "AI Powered", value: aiPowered, set: setAiPowered },
                    ] as const).map((f) => (
                      <label key={f.key} className="flex items-center gap-2 cursor-pointer rounded-lg border border-border bg-card px-2.5 py-2">
                        <input
                          type="checkbox"
                          checked={f.value}
                          onChange={(e) => {
                            f.set(e.target.checked);
                            updateUrl();
                          }}
                          className="h-3.5 w-3.5 text-primary border-border rounded focus:ring-primary"
                        />
                        <span className="text-xs text-foreground">{f.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rating</label>
                    <select
                      value={minRating}
                      onChange={(e) => {
                        setMinRating(Number(e.target.value));
                        updateUrl();
                      }}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none bg-no-repeat bg-right-3 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')]"
                    >
                      {RATING_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Platform */}
                  {platformOptions.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Platform</label>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 border border-border rounded-xl bg-card p-2">
                        {platformOptions.map((p) => (
                          <label key={p} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPlatforms.includes(p)}
                              onChange={() => {
                                togglePlatform(p);
                                updateUrl();
                              }}
                              className="h-3.5 w-3.5 text-primary border-border rounded focus:ring-primary"
                            />
                            <span className="text-xs text-foreground truncate">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Integrations */}
                  {integrationOptions.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Integrations</label>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 border border-border rounded-xl bg-card p-2">
                        {integrationOptions.map((i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIntegrations.includes(i)}
                              onChange={() => {
                                toggleIntegration(i);
                                updateUrl();
                              }}
                              className="h-3.5 w-3.5 text-primary border-border rounded focus:ring-primary"
                            />
                            <span className="text-xs text-foreground truncate">{i}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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

          {/* Mobile Sticky Apply Bar */}
          <div className="p-3.5 border-t border-border bg-white md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all text-center"
            >
              Show {filteredTools.length} Tool{filteredTools.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1">
        {/* Top Bar: Search + Sort (Desktop) / Filter Toggle (Mobile) */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-border px-3 py-2.5 sm:px-6 sm:py-4 lg:px-8">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            {/* Search + Mobile Filter Button Row */}
            <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:max-w-md min-w-0">
              <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full min-w-0 rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-xs sm:text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </form>

              {/* Filter Sidebar Toggle - Mobile */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold shrink-0 transition-all hover:border-primary/30 hover:text-primary shadow-xs"
              >
                <FilterIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Filters</span>
                {filterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.2 text-[9.5px] font-bold text-primary-foreground">
                    {filterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Dual Dropdowns: Pricing & Sort */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1 md:hidden [&>*]:min-w-0">
              <div className="relative min-w-0">
                <label className="sr-only">Pricing</label>
                <select
                  value={pricing}
                  onChange={(e) => handlePricingChange(e.target.value as PricingFilter)}
                  className="w-full min-w-0 truncate rounded-xl border border-border bg-card pl-2.5 pr-6 py-2 text-xs font-medium outline-none text-foreground shadow-xs appearance-none bg-no-repeat bg-right-2 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')]"
                >
                  {PRICING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-0">
                <label className="sr-only">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="w-full min-w-0 truncate rounded-xl border border-border bg-card pl-2.5 pr-6 py-2 text-xs font-medium outline-none text-foreground shadow-xs appearance-none bg-no-repeat bg-right-2 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Dropdowns: Pricing & Sort */}
            <div className="hidden md:flex items-center gap-2">
              <label className="sr-only">Pricing</label>
              <select
                value={pricing}
                onChange={(e) => handlePricingChange(e.target.value as PricingFilter)}
                className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none bg-no-repeat bg-right-3 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')]"
              >
                {PRICING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

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
          </div>
        </div>

        {/* Results Header */}
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center justify-between gap-2 sm:block">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-base sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
                  Discover AI tools
                </h1>
                <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold shrink-0">
                  {filteredTools.length}
                </span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-primary font-medium hover:underline shrink-0 sm:hidden"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Active Filter Pills */}
            {filterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {query && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    <Search className="h-3 w-3" />
                    "{query}"
                    <button onClick={() => { setQuery(""); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {pricing !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    {pricing}
                    <button onClick={() => { handlePricingChange("All"); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {freePlan && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    Free Plan
                    <button onClick={() => { setFreePlan(false); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {freeTrial && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    Free Trial
                    <button onClick={() => { setFreeTrial(false); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {apiAvailable && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    API Available
                    <button onClick={() => { setApiAvailable(false); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {aiPowered && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    AI Powered
                    <button onClick={() => { setAiPowered(false); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    Rating {minRating}+
                    <button onClick={() => { setMinRating(0); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPlatforms.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    {p}
                    <button onClick={() => { togglePlatform(p); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedIntegrations.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                    {i}
                    <button onClick={() => { toggleIntegration(i); updateUrl(); }} className="ml-1 hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mx-auto max-w-7xl px-3 pb-12 sm:px-6 lg:px-8">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 [&>*]:min-w-0">
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
      </div>

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
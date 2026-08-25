"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiTrendingUp,
  FiStar,
  FiBookmark,
  FiArrowUp,
  FiHeadphones,
  FiBarChart2,
  FiBriefcase,
  FiSettings,
  FiZap,
  FiEdit3,
  FiPenTool,
  FiCode,
  FiRepeat,
  FiChevronRight,
} from "react-icons/fi";
import { ToolLogo } from "./ToolLogo";
import { withResolvedLogo } from "../lib/tool-logos";
import { useSavedTools } from "../lib/saved-tools-context";
import { api } from "../lib/api";

interface Tool {
  name: string;
  desc: string;
  tags: string[];
  logo: string;
  website?: string;
  upvotes: number;
  clicks?: number;
  saves: number;
  isNew?: boolean;
  slug?: string;
}

interface Category {
  key: string;
  label: string;
  icon: React.ReactNode;
}

type TabKey = "popular" | "recent";

const FALLBACK_CATEGORIES: Category[] = [
  { key: "Customer Service & Support", label: "Customer Service & Support", icon: <FiHeadphones /> },
  { key: "Sales", label: "Sales", icon: <FiBarChart2 /> },
  { key: "Back Office", label: "Back Office", icon: <FiBriefcase /> },
  { key: "Operations", label: "Operations", icon: <FiSettings /> },
  { key: "Growth & Marketing", label: "Growth & Marketing", icon: <FiZap /> },
  { key: "Writing & Editing", label: "Writing & Editing", icon: <FiEdit3 /> },
  { key: "Design & Creative", label: "Design & Creative", icon: <FiPenTool /> },
  { key: "Technology & IT", label: "Technology & IT", icon: <FiCode /> },
  { key: "Workflow Automation", label: "Workflow Automation", icon: <FiRepeat /> },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "customer service & support": <FiHeadphones />,
  sales: <FiBarChart2 />,
  "back office": <FiBriefcase />,
  operations: <FiSettings />,
  "growth & marketing": <FiZap />,
  "writing & editing": <FiEdit3 />,
  "design & creative": <FiPenTool />,
  "technology & it": <FiCode />,
  "workflow automation": <FiRepeat />,
};

function categoryIconFor(name: string) {
  return CATEGORY_ICONS[name.toLowerCase()] || <FiZap />;
}

function fmtNum(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toolHref(tool: Tool) {
  const slug = tool.slug || toSlug(tool.name);
  return `/tool/${encodeURIComponent(slug)}`;
}

function DirectoryToolCard({ tool }: { tool: Tool }) {
  const { isSaved, isPending, toggleSave } = useSavedTools();
  const slug = tool.slug || toSlug(tool.name);
  const saved = isSaved(slug);
  const pending = isPending(slug);
  const [upvotes, setUpvotes] = useState(tool.upvotes || 0);
  const [voted, setVoted] = useState(false);
  const [voteBusy, setVoteBusy] = useState(false);

  useEffect(() => {
    setUpvotes(tool.upvotes || 0);
  }, [tool.upvotes, slug]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vot_upvoted_tools");
      const list: string[] = raw ? JSON.parse(raw) : [];
      setVoted(list.includes(slug));
    } catch {
      setVoted(false);
    }
  }, [slug]);

  function onSaveClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    void toggleSave({
      slug,
      name: tool.name,
      desc: tool.desc,
      logo: tool.logo,
      tags: tool.tags,
    });
  }

  async function onUpvoteClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (voteBusy) return;
    setVoteBusy(true);
    const nextVoted = !voted;
    setVoted(nextVoted);
    setUpvotes((n) => Math.max(0, n + (nextVoted ? 1 : -1)));
    try {
      const res = nextVoted
        ? await api.upvoteTool(slug)
        : await api.removeToolUpvote(slug);
      setUpvotes(res.upvotes);
      const raw = localStorage.getItem("vot_upvoted_tools");
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = nextVoted
        ? Array.from(new Set([...list, slug]))
        : list.filter((s) => s !== slug);
      localStorage.setItem("vot_upvoted_tools", JSON.stringify(next));
    } catch {
      setVoted(!nextVoted);
      setUpvotes((n) => Math.max(0, n + (nextVoted ? -1 : 1)));
    } finally {
      setVoteBusy(false);
    }
  }

  return (
    <Link
      href={toolHref(tool)}
      className="group flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:border-[#6366F1]/45 hover:bg-[#6366F1]/[0.04] hover:shadow-[0_8px_24px_rgba(99,102,241,0.08)] sm:items-center sm:px-4"
    >
      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] transition-colors group-hover:border-[#6366F1]/35 sm:mt-0 sm:h-12 sm:w-12">
        <ToolLogo name={tool.name} logo={tool.logo} website={tool.website} size={26} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-[#111827] transition-colors group-hover:text-[#4F46E5]">
            {tool.name}
          </span>
          {tool.isNew && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
              New
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-[#6B7280] sm:truncate sm:line-clamp-1">
          {tool.desc}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10.5px] font-medium text-[#6366F1]"
            >
              #{tag.toLowerCase().replace(/\s+/g, "")}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <button
          type="button"
          onClick={onSaveClick}
          disabled={pending}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${tool.name} from saved tools` : `Save ${tool.name}`}
          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] transition-colors disabled:opacity-60 ${
            saved
              ? "border-[#6366F1]/40 bg-[#EEF2FF] text-[#4F46E5]"
              : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#6366F1]/40 hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
          }`}
        >
          <FiBookmark size={12} className={`shrink-0 ${saved ? "fill-current" : ""}`} />
          {fmtNum(tool.saves + (saved ? 1 : 0))}
        </button>
        <button
          type="button"
          onClick={onUpvoteClick}
          disabled={voteBusy}
          aria-pressed={voted}
          aria-label={voted ? `Remove upvote from ${tool.name}` : `Upvote ${tool.name}`}
          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-60 ${
            voted
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          <FiArrowUp size={12} className="shrink-0" />
          {fmtNum(upvotes)}
        </button>
      </div>
    </Link>
  );
}

export default function AIToolsDirectory() {
  const [activeTab, setActiveTab] = useState<TabKey>("popular");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [popularTools, setPopularTools] = useState<Tool[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [categoryTools, setCategoryTools] = useState<Tool[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    down: boolean;
    moved: boolean;
    startX: number;
    scrollLeft: number;
  }>({
    down: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    Promise.all([
      fetch("/api/static/explore/popular").then((r) => r.json()),
      fetch("/api/static/explore/recent").then((r) => r.json()),
      fetch("/api/tools/categories").then((r) => r.json()),
    ])
      .then(([popular, recent, cats]) => {
        if (cancelled) return;
        setPopularTools((Array.isArray(popular) ? popular : []).map(withResolvedLogo));
        setRecentTools((Array.isArray(recent) ? recent : []).map(withResolvedLogo));
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(
            cats.map((c: any) => {
              const name = String(c.name || c.label || c.key || "");
              return {
                key: name,
                label: name,
                icon: categoryIconFor(name),
              };
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeCat === null) {
      setCategoryTools([]);
      return;
    }
    let cancelled = false;
    setListLoading(true);
    fetch(`/api/static/categories/${encodeURIComponent(activeCat)}/tools`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setCategoryTools(list.slice(0, 10).map(withResolvedLogo));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCat]);

  const tools =
    activeCat === null
      ? activeTab === "popular"
        ? popularTools
        : recentTools
      : categoryTools;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "popular", label: "Popular Tools", icon: <FiTrendingUp size={14} />, badge: popularTools.length || 15 },
    { key: "recent", label: "Recently Added", icon: <FiStar size={14} />, badge: recentTools.length || 15 },
  ];

  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    setActiveCat(null);
  };

  const handleCategoryClick = (catKey: string) => {
    setActiveCat((prev) => (prev === catKey ? null : catKey));
  };

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = sliderRef.current;
    if (!el) return;
    dragRef.current = {
      down: true,
      moved: false,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
    };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = sliderRef.current;
    if (!el || !dragRef.current.down) return;
    const walk = e.clientX - dragRef.current.startX;
    if (Math.abs(walk) > 6) dragRef.current.moved = true;
    if (dragRef.current.moved) {
      el.scrollLeft = dragRef.current.scrollLeft - walk;
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = sliderRef.current;
    dragRef.current.down = false;
    el?.releasePointerCapture(e.pointerId);
  }

  function categoryChipClick(catKey: string) {
    if (dragRef.current.moved) return;
    handleCategoryClick(catKey);
  }

  return (
    <section className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 text-center lg:mb-8 lg:text-left">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl lg:text-[28px]">
            Find The Best AI Tools & Software
          </h2>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Explore top AI tools by category — curated for every workflow.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:min-h-[560px] lg:rounded-2xl lg:border lg:border-[#E5E7EB] lg:bg-white lg:shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          {/* Desktop sidebar */}
          <aside className="hidden w-[240px] shrink-0 border-r border-[#E5E7EB] py-5 lg:block">
            <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
              Most Popular Categories
            </p>
            <div className="flex flex-col gap-0.5 px-2">
              {categories.map((cat) => {
                const isActive = cat.key === activeCat;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 group ${
                      isActive
                        ? "bg-[#EEF2FF] font-medium text-[#6366F1]"
                        : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`text-base shrink-0 ${
                          isActive ? "text-[#6366F1]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
                        }`}
                      >
                        {cat.icon}
                      </span>
                      <span className="truncate text-[13px]">{cat.label}</span>
                    </span>
                    {isActive && <FiChevronRight size={14} className="shrink-0 text-[#6366F1]" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Mobile category slider */}
          <div className="lg:hidden">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
              Most Popular Categories
            </p>
            <div
              ref={sliderRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="flex cursor-grab touch-pan-x snap-x snap-mandatory gap-2 overflow-x-auto pb-3 active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {categories.map((cat) => {
                const isActive = cat.key === activeCat;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => categoryChipClick(cat.key)}
                    className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] transition-colors ${
                      isActive
                        ? "border-[#6366F1] bg-[#EEF2FF] font-medium text-[#6366F1]"
                        : "border-[#E5E7EB] bg-white text-[#6B7280]"
                    }`}
                  >
                    <span className={isActive ? "text-[#6366F1]" : "text-[#9CA3AF]"}>{cat.icon}</span>
                    <span className="whitespace-nowrap">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex gap-1 overflow-x-auto border-b border-[#E5E7EB] px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key && activeCat === null;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabClick(tab.key)}
                    className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 text-[13px] font-medium transition-colors sm:px-5 ${
                      isActive ? "text-[#6366F1]" : "text-[#6B7280] hover:text-[#374151]"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.badge !== undefined && (
                      <span className="rounded-full bg-[#6366F1] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                        +{tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full bg-[#6366F1] sm:left-3 sm:right-3" />
                    )}
                  </button>
                );
              })}
            </div>

            {activeCat && (
              <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5">
                <p className="truncate text-sm font-medium text-[#374151]">{activeCat}</p>
                <button
                  type="button"
                  onClick={() => setActiveCat(null)}
                  className="text-xs font-medium text-[#6366F1] hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 p-3 sm:p-4">
              {listLoading ? (
                <div className="flex flex-col gap-2 py-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[78px] animate-pulse rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]"
                    />
                  ))}
                </div>
              ) : tools.length === 0 ? (
                <p className="py-16 text-center text-sm text-[#9CA3AF]">
                  No tools found for this category.
                </p>
              ) : (
                tools.map((tool, i) => (
                  <DirectoryToolCard key={`${tool.name}-${i}`} tool={tool} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

"use client";

import StatsSection from "./ui/CountUp";
import { SearchBar } from "./ui/SearchBar";
import heroBg from "../assets/images/HeroSection.png";
import Link from "next/link";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
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

interface Tool {
  name: string;
  desc: string;
  tags: string[];
  logo: string;
  upvotes: number;
  saves: number;
  isNew?: boolean;
}

interface Category {
  key: string;
  label: string;
  icon: React.ReactNode;
}

type TabKey = "popular" | "recent" | "courses";

const categories: Category[] = [
  { key: "Customer Service & Support", label: "Customer Service & Support", icon: <FiHeadphones /> },
  { key: "Sales",                      label: "Sales",                      icon: <FiBarChart2 /> },
  { key: "Back Office",                label: "Back Office",                icon: <FiBriefcase /> },
  { key: "Operations",                 label: "Operations",                 icon: <FiSettings /> },
  { key: "Growth & Marketing",         label: "Growth & Marketing",         icon: <FiZap /> },
  { key: "Writing & Editing",          label: "Writing & Editing",          icon: <FiEdit3 /> },
  { key: "Design & Creative",          label: "Design & Creative",          icon: <FiPenTool /> },
  { key: "Technology & IT",            label: "Technology & IT",            icon: <FiCode /> },
  { key: "Workflow Automation",        label: "Workflow Automation",        icon: <FiRepeat /> },
];

function fmtNum(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function ToolCard({ tool, rank }: { tool: Tool; rank: number }) {
  return (
    <div className="group flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:border-[#6366F1] hover:bg-[#6366F1]/[0.04] transition-all duration-200 cursor-pointer">
      <span className="text-xs font-medium text-gray-400 w-5 shrink-0 text-right">{rank}.</span>

      <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[#6366F1]/40 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tool.logo}
          alt={tool.name}
          width={22}
          height={22}
          className="object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{tool.name}</span>
          {tool.isNew && (
            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              New
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{tool.desc}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {tool.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10.5px] text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors">
          <FiBookmark size={12} />
          <span>{fmtNum(tool.saves)}</span>
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 transition-colors">
          <FiArrowUp size={12} />
          <span>{fmtNum(tool.upvotes)}</span>
        </button>
      </div>
    </div>
  );
}

export default function AIToolsDirectory() {
  const [activeTab, setActiveTab] = useState<TabKey>("popular");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [popularTools, setPopularTools] = useState<Tool[]>([]);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [categoryTools, setCategoryTools] = useState<Tool[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/static/explore/popular").then((r) => r.json()),
      fetch("/api/static/explore/recent").then((r) => r.json()),
    ]).then(([popular, recent]) => {
      setPopularTools(popular);
      setRecentTools(recent);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeCat === null) {
      setCategoryTools([]);
      return;
    }
    fetch(`/api/static/categories/${encodeURIComponent(activeCat)}/tools`)
      .then((r) => r.json())
      .then((data) => setCategoryTools(data.slice(0, 10)))
      .catch(() => {});
  }, [activeCat]);

  // Data shown: if a category is selected, show that category's tools.
  // Otherwise, show whichever tab (Popular Tools / Recently Added) is active.
  const tools = activeCat === null
    ? (activeTab === "popular" ? popularTools : recentTools)
    : categoryTools;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "popular", label: "Popular Tools",   icon: <FiTrendingUp size={14} /> },
    { key: "recent",  label: "Recently Added",  icon: <FiStar size={14} /> },
  ];

  // Clicking a top tab: switches the active tab (moves underline) and
  // clears any selected category so the tab's own data is shown.
  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    setActiveCat(null);
  };

  // Clicking a sidebar category: only changes which category's tools are
  // displayed. It never touches activeTab, so the underline never moves.
  const handleCategoryClick = (catKey: string) => {
    setActiveCat(catKey);
  };

  return (
    <div className="mx-auto flex flex-col lg:flex-row min-h-[600px] font-sans bg-white px-4 sm:px-6 lg:px-8">
      <aside className="w-full lg:w-[220px] lg:shrink-0 lg:border-r border-b lg:border-b-0 border-gray-200 py-3 lg:py-5 px-3 overflow-x-auto lg:overflow-x-visible">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2 hidden lg:block">
          Most Popular Categories
        </p>

        <div className="flex lg:flex-col gap-1 w-max lg:w-auto">
          {categories.map((cat) => {
            const isActive = cat.key === activeCat;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left group whitespace-nowrap lg:whitespace-normal
                  ${isActive
                    ? "bg-[#6366F1]/10 text-[#6366F1] font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`text-base shrink-0 ${isActive ? "text-[#6366F1]" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {cat.icon}
                  </span>
                  <span className="truncate text-[12.5px]">{cat.label}</span>
                </div>
                {isActive && <FiChevronRight size={13} className="shrink-0 text-[#6366F1] hidden lg:block" />}
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex border-b border-gray-200 bg-white px-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium transition-colors whitespace-nowrap
                  ${isActive ? "text-[#6366F1]" : "text-gray-500 hover:text-gray-700"}`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="bg-[#6366F1] text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#6366F1] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 p-4">
          {tools.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-16">No tools found for this category.</p>
          ) : (
            tools.map((tool, i) => (
              <ToolCard key={`${tool.name}-${i}`} tool={tool} rank={i + 1} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function HeroSection() {
  const [searchTerms, setSearchTerms] = useState<string[]>([
    "AI Writing", "AI Image", "AI Video", "AI Coding", "Chatbots",
  ]);

  useEffect(() => {
    fetch("/api/static/explore/search-terms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) setSearchTerms(data);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="relative overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-20 lg:pt-10 lg:pb-24">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg.src})` }}
      />

      <div className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-sm" />

      <div className="absolute top-10 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
          Welcome to Vault of Tools <Sparkles className="size-4" />
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
          Discover The Best <br />
          <span className="text-primary">AI Tools</span> For Every Need
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          Find, compare and review the world best AI tools all in one smart
          directory.
        </p>

        <div className="mx-auto mt-8 max-w-4xl">
          <SearchBar />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              Popular:
            </span>

            {searchTerms.map((item) => (
              <Link
                key={item}
                href={`/discover?q=${encodeURIComponent(item)}`}
                className="rounded-full border px-3 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <StatsSection />
      </div>
    </header>
  );
}

export { HeroSection,  ToolCard };

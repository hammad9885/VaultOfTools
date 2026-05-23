"use client";

import { useState, useEffect } from "react";
import {
  categories,
  featuredTools,
  quickFilters,
  heroStats,
} from "./utils/Data";
import { splitColor, rankColor, buildStars } from "./helpers/Helpers";
import Link from "next/link";
import type { PHProduct } from "./types/types";
import Image from "next/image";
import axios from "axios";


export default function Home() {
  const [activeTab, setActiveTab] = useState<"featured" | "trending">(
    "featured",
  );
  const [liveTools, setLiveTools] = useState<PHProduct[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [trendingError, setTrendingError] = useState(false);

useEffect(() => {
  if (activeTab !== "trending") return;

  const fetchTrending = async () => {
    setLoadingTrending(true);
    setTrendingError(false);

    try {
      const res = await axios("/api/trending");
      const data = await res.data;

      setLiveTools(data);
    }catch {
  setTrendingError(true);
    } finally {
      setLoadingTrending(false);
    }
  };

  fetchTrending();
}, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-87.5 bg-linear-to-br from-emerald-200/50 via-teal-100/40 to-sky-100/30 dark:from-emerald-900/20 dark:via-teal-900/15 dark:to-sky-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-amber-100/30 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            3,200+ AI Tools Tracked in Real-time
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 leading-tight tracking-tight max-w-2xl mx-auto mb-5">
            The{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Smartest Way
            </span>{" "}
            to{" "}
            <span className="text-slate-400 dark:text-slate-500">
              Discover AI Tools
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto mb-8 leading-relaxed font-light">
            Find, compare and track the best AI tools across every category.
            Updated daily with live pricing and alternatives.
          </p>
          <div className="flex items-center max-w-xl mx-auto mb-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-700 focus-within:border-emerald-400 dark:focus-within:border-emerald-600 transition-all">
            <i
              className="ti ti-search text-slate-400 dark:text-slate-500 text-lg px-4"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Try: 'AI tools for legal research'..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200 py-3.5 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2 m-1.5 rounded-lg transition-colors">
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {quickFilters.map((t) => (
              <button
                key={t.label}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-3 py-1.5 rounded-full transition-all"
              >
                <i className={`ti ${t.icon} text-sm`} aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-8">
            {heroStats.map((s, i) => (
              <div key={s.lbl} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {s.num}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {s.lbl}
                  </div>
                </div>
                {i < heroStats.length - 1 && (
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Browse Categories
          </h2>
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            All 89 categories{" "}
            <i className="ti ti-arrow-right text-sm" aria-hidden="true" />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const { bg, text } = splitColor(cat.color);
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} dark:opacity-80 shrink-0`}
                >
                  <Icon className={`text-lg ${text}`} aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {cat.count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-10">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("featured")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
              activeTab === "featured"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-md"
                : "bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            Featured Tools
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
              activeTab === "trending"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300 shadow-md"
                : "bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Trending
          </button>
        </div>
        {activeTab === "featured" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featuredTools.map((tool) => (
              <div
                key={tool.name}
                className="relative flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-slate-900 cursor-pointer transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                {tool.sponsored && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full tracking-wide">
                    Sponsored
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tool.iconBg}`}
                  >
                    <tool.icon size={tool.iconSize} color={tool.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {tool.name}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {tool.tagline}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tool.desc}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${tool.pricingClass}`}
                  >
                    {tool.pricing}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {buildStars(tool.stars).map(({ index, filled }) => (
                      <i
                        key={index}
                        className={`ti ti-star-filled text-xs ${filled ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-1.5">
                      {tool.rating} ({tool.reviews})
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {tool.updated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "trending" && (
          <div className="flex flex-col gap-2">
            {loadingTrending &&
              [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl animate-pulse"
                >
                  <div className="w-5 h-4 bg-slate-200 dark:bg-slate-700 rounded shrink-0" />
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                  </div>
                  <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              ))}

            {!loadingTrending && trendingError && (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <i className="ti ti-wifi-off text-2xl mb-2 block" />
                <p className="text-sm">
                  Could not load trending data. Try again later.
                </p>
              </div>
            )}
            {!loadingTrending &&
              !trendingError &&
              liveTools.map((t) => (
                <Link
                  key={t.rank}
                  href={t.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm cursor-pointer transition-all no-underline"
                >
                  <span
                    className={`text-sm font-bold min-w-5 text-center shrink-0 ${rankColor(t.rank)}`}
                  >
                    {t.rank}
                  </span>

                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {t.thumbnail ? (
                      <Image
                        src={t.thumbnail}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <i className="ti ti-robot text-slate-400 text-sm" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t.name}
                    </div>

                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {t.tagline}
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap shrink-0">
                    <i className="ti ti-arrow-up text-xs" />
                    {t.votes}
                  </span>
                </Link>
              ))}
          </div>
        )}
      </section>

      <div className="mx-6 mb-10">
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-emerald-50/80 dark:from-emerald-900/20 to-transparent pointer-events-none" />
          <div className="relative">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-2">
              <i
                className="ti ti-rocket text-emerald-500 text-xl"
                aria-hidden="true"
              />
              Built something amazing?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Submit your AI tool to reach 180,000+ monthly visitors. Get listed
              in 24 hours. Free forever, or go sponsored for premium placement.
            </p>
          </div>
          <div className="relative flex gap-2.5 shrink-0">
            <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg transition-all">
              Learn more
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-lg transition-colors shadow-sm shadow-emerald-200 dark:shadow-emerald-900">
              <i className="ti ti-send text-sm" aria-hidden="true" />
              Submit Your Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

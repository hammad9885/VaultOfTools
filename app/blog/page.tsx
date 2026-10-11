"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Cpu,
  Mail,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { MotionProps } from "framer-motion";
import { api } from "../lib/api";
import { SiteFooter, SiteNav } from "../routes";
import { posts as dataPosts } from "./[slug]/data";


function fadeUp(delay = 0): MotionProps {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.5, ease: "easeOut", delay },
  };
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...fadeUp(0)} className="inline-block">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold tracking-wide text-[#4F46E5] shadow-xs">
        <Sparkles className="size-3 shrink-0" />
        {children}
      </span>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      {...fadeUp(0.05)}
      className="mt-3 sm:mt-4 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl"
    >
      {children}
    </motion.h2>
  );
}


const catIcons: Record<string, { icon: typeof Cpu; color: string; bg: string }> = {
  "Image Generation": { icon: Cpu, color: "#4F46E5", bg: "#EEF2FF" },
  Coding: { icon: Cpu, color: "#7C3AED", bg: "#F5F3FF" },
  "Voice & Audio": { icon: Star, color: "#6366F1", bg: "#EEF2FF" },
  Productivity: { icon: Zap, color: "#4F46E5", bg: "#EEF2FF" },
  Chatbots: { icon: TrendingUp, color: "#7C3AED", bg: "#F5F3FF" },
  Marketing: { icon: Users, color: "#6366F1", bg: "#EEF2FF" },
};
const iconRegistry: Record<string, any> = {
  Cpu, Star, Zap, TrendingUp, Users, Check, Sparkles,
};
type ArticleData = { slug: string; cat: string; title: string; desc: string; date: string; time: string; coverImage?: string };
type CategoryData = { name: string; count: number };

const fallbackCategories: CategoryData[] = [
  ...new Set(dataPosts.map((p) => p.category)),
].map((name) => ({
  name,
  count: dataPosts.filter((p) => p.category === name).length * 8,
}));

const fallbackArticles: ArticleData[] = dataPosts.map((p) => ({
  slug: p.slug,
  cat: p.category,
  title: p.title,
  desc: p.excerpt,
  date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  time: p.readTime,
  coverImage: p.coverImage,
}));

export default function BlogLanding() {
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [nlEmail, setNlEmail] = useState("");
  const [blogPosts, setBlogPosts] = useState<{ _id?: string; title: string; slug: string; excerpt: string; category: string; date?: string; readTime?: string; coverImage?: string }[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [blogStatic, setBlogStatic] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [postsRes, cats] = await Promise.all([
          api.getBlogPosts({ limit: 6 }).catch(() => null),
          api.getBlogCategories().catch(() => null),
        ]);
        if (postsRes?.posts) setBlogPosts(postsRes.posts);
        if (cats) setCategories(cats);
      } catch { /* use fallbacks */ }
    }
    load();
  }, []);

  useEffect(() => {
    fetch("/api/static/blog/static")
      .then((res) => res.json())
      .then(setBlogStatic)
      .catch(() => {});
  }, []);

  const displayCatIcons = blogStatic?.catIcons
    ? (blogStatic.catIcons as any[]).reduce((acc: any, ci: any) => {
        acc[ci.name] = { icon: iconRegistry[ci.icon] || Cpu, color: ci.color || "#4F46E5", bg: ci.bg || "#EEF2FF" };
        return acc;
      }, {} as any)
    : null;

  const popularComparisons: string[] = (blogStatic?.popularComparisonsSidebar as any[])?.length > 0
    ? (blogStatic.popularComparisonsSidebar as string[])
    : ["ChatGPT vs Claude", "Midjourney vs DALL·E", "Notion AI vs ClickUp AI", "Jasper vs Copy.ai", "Zapier vs Make"];

  const trendingToolsItems: string[] = (blogStatic?.trendingToolsSidebar as any[])?.length > 0
    ? (blogStatic.trendingToolsSidebar as string[])
    : ["ChatGPT", "Claude", "Midjourney", "Notion AI", "Perplexity"];

  const trustItems = blogStatic?.trustFeatures?.length > 0
    ? (blogStatic.trustFeatures as any[]).map((f: any) => ({
        icon: iconRegistry[f.icon] || Star,
        title: f.title,
        desc: f.desc,
      }))
    : [
        { icon: Star, title: "Expert Reviews", desc: "Every tool is tested and reviewed by industry experts with years of real-world experience." },
        { icon: Users, title: "Unbiased & Independent", desc: "We never accept payment for reviews. Our recommendations are 100% objective." },
        { icon: TrendingUp, title: "Updated Regularly", desc: "The AI landscape changes fast. We update our reviews and data every single week." },
        { icon: Check, title: "Trusted by Thousands", desc: "Join 50,000+ professionals who rely on Vault of Tools for their AI decisions." },
      ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;
  const displayArticles: ArticleData[] = blogPosts.length > 0
    ? blogPosts.map((p) => ({ slug: p.slug, cat: p.category, title: p.title, desc: p.excerpt, date: p.date ? new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "", time: p.readTime || "", coverImage: p.coverImage }))
    : fallbackArticles;

  const featuredPost = dataPosts.find((p) => p.featured) || dataPosts[0];

  const filteredArticles = useMemo(() => {
    return displayArticles.filter((a) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.cat.toLowerCase().includes(q);
      const matchesCat =
        selectedCategory === "All" ||
        a.cat.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [displayArticles, searchQuery, selectedCategory]);

  return (
    <>
    <SiteNav />
    <main className="overflow-x-hidden font-sans">

      <section
        className="relative overflow-hidden px-3.5 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 60%, #F2F3FF 100%)" }}
      >
        {/* background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-[#4F46E5]/8 blur-[100px] sm:blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] rounded-full bg-[#6366F1]/6 blur-[80px] sm:blur-[100px]" />
          <div className="absolute top-1/2 left-1/4 h-48 w-48 sm:h-60 sm:w-60 rounded-full bg-[#7C3AED]/5 blur-[60px] sm:blur-[80px]" />
          {/* subtle grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4F46E5" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* ---------- Left ---------- */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <SectionTag>Blog &amp; Resources</SectionTag>

              <h1 className="mt-4 sm:mt-6 text-2xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#0F172A]">
                Tools, Reviews &amp;{" "}
                <span className="text-[#4F46E5]">Industry Insights</span>
              </h1>

              <p className="mt-3 sm:mt-5 max-w-lg text-sm leading-relaxed text-[#475569] sm:text-lg">
                Discover useful tools, reviews, guides, trends, and insights.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => document.getElementById("latest-articles")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-[#4F46E5]/25 cursor-pointer sm:w-auto"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #6D5DF6)" }}
                >
                  Explore Articles
                  <ArrowRight className="size-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => document.getElementById("nl-cta")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-[#E5E7EB] bg-white px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#0F172A] shadow-xs transition hover:shadow-md cursor-pointer sm:w-auto"
                >
                  <Mail className="size-4" />
                  Subscribe Newsletter
                </motion.button>
              </div>
            </motion.div>

            {/* ---------- Right (illustration) ---------- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative h-[460px] w-full">
                {/* Central glass card */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 m-auto h-72 w-72 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-xl"
                  style={{ boxShadow: "0 25px 80px rgba(79,70,229,0.15)" }}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-[10px] font-bold text-white">AI</div>
                      <span className="text-xs font-semibold text-[#0F172A]">Latest Insights</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2.5 w-full rounded-full bg-[#E5E7EB]" />
                      <div className="h-2.5 w-3/4 rounded-full bg-[#E5E7EB]" />
                      <div className="h-2.5 w-5/6 rounded-full bg-[#E5E7EB]" />
                      <div className="flex gap-2 pt-1">
                        <div className="h-8 w-8 rounded-lg bg-[#4F46E5]/15" />
                        <div className="h-8 w-8 rounded-lg bg-[#7C3AED]/15" />
                        <div className="h-8 w-8 rounded-lg bg-[#6366F1]/15" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-[#4F46E5] font-semibold">
                        <TrendingUp className="size-3" /> Trending
                      </span>
                      <span className="text-xs text-[#94A3B8]">Updated daily</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating icons */}
                <motion.div
                  animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 right-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/70 shadow-lg backdrop-blur-xl"
                >
                  <Cpu className="size-6 text-[#4F46E5]" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 14, 0], rotate: [0, -6, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-12 left-0 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/70 shadow-lg backdrop-blur-xl"
                >
                  <Star className="size-6 text-[#7C3AED]" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/70 shadow-lg backdrop-blur-xl"
                >
                  <Zap className="size-6 text-[#6366F1]" />
                </motion.div>

                {/* decorative circles */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-15" viewBox="0 0 500 500">
                  <circle cx="250" cy="250" r="180" fill="none" stroke="#4F46E5" strokeWidth="0.5" strokeDasharray="6 4" />
                  <circle cx="250" cy="250" r="130" fill="none" stroke="#6366F1" strokeWidth="0.5" strokeDasharray="6 4" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  FEATURED ARTICLE                                                 */}
      {/* ================================================================ */}
      <section className="bg-[#F8FAFF] px-3.5 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp(0)}>
            <SectionTag>Editor&apos;s Pick</SectionTag>
            <SectionTitle>Featured Article</SectionTitle>
          </motion.div>

          <div className="mt-6 sm:mt-10 grid gap-6 lg:grid-cols-3 lg:gap-10">
            {/* ---------- Left: featured card ---------- */}
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="lg:col-span-2 block group"
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative h-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E5E7EB] bg-white transition-all hover:shadow-xl hover:border-[#4F46E5]/40"
                style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.06)" }}
              >
                <div className="relative h-48 w-full sm:h-72 lg:h-80 bg-[#EEF2FF] overflow-hidden">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <span className="absolute left-3 top-3 sm:left-5 sm:top-5 inline-flex items-center rounded-lg bg-white/95 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-[#4F46E5] shadow-xs backdrop-blur-xs">
                    {featuredPost.category}
                  </span>
                </div>

                <div className="p-4 sm:p-7">
                  <h3 className="text-base sm:text-2xl lg:text-3xl font-bold text-[#0F172A] leading-snug group-hover:text-[#4F46E5] transition-colors line-clamp-2">
                    {featuredPost.title}
                  </h3>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base leading-relaxed text-[#475569] line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-[#4F46E5]" />{" "}
                      {new Date(featuredPost.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-[#4F46E5]" />{" "}
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <div className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#4F46E5] px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all group-hover:bg-[#4338CA]">
                    Read Full Article <ArrowRight className="size-4" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* ---------- Right sidebar ---------- */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Search */}
              <div
                className="rounded-2xl border border-[#E5E7EB] bg-white p-3.5 sm:p-5"
                style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}
              >
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2 block">
                  Search Articles
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFF] px-3.5 py-2.5">
                  <Search className="size-4 text-[#94A3B8] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by topic, model, or tool..."
                    className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-[#94A3B8]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[#94A3B8] hover:text-[#0F172A] p-0.5 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Newsletter */}
              <div
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-6"
                style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                  <Mail className="size-5" />
                </div>
                <h4 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-[#0F172A]">
                  Weekly AI Digest
                </h4>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Get the best curated AI tools, breakdown guides, and tips
                  delivered to your inbox every week.
                </p>
                <div className="mt-3.5">
                  <input
                    type="email"
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFF] px-3.5 py-2.5 text-xs sm:text-sm outline-none placeholder:text-[#94A3B8]"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!nlEmail) return;
                    try {
                      await api.subscribeNewsletter(nlEmail);
                      toast.success("Subscribed successfully!");
                      setNlEmail("");
                    } catch (e: unknown) {
                      toast.error(
                        e instanceof Error ? e.message : "Subscription failed"
                      );
                    }
                  }}
                  className="mt-2.5 w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:shadow-md transition cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #4F46E5, #6D5DF6)",
                  }}
                >
                  Subscribe Free
                </motion.button>
                <p className="mt-2 text-[11px] text-[#94A3B8] text-center">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  BROWSE BY CATEGORIES                                             */}
      {/* ================================================================ */}
      <section className="bg-white px-3.5 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <SectionTag>Categories</SectionTag>
          <SectionTitle>Browse by Categories</SectionTitle>

          <div className="mt-6 sm:mt-10 grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 [&>*]:min-w-0">
            {displayCategories.map((cat, i) => {
              const meta = (displayCatIcons || catIcons)[cat.name] || { icon: Cpu, color: "#4F46E5", bg: "#EEF2FF" };
              const IconComp = meta.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

              return (
                <motion.button
                  key={cat.name}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setSelectedCategory(isSelected ? "All" : cat.name);
                    document.getElementById("latest-articles")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group flex items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl border ${
                    isSelected
                      ? "border-[#4F46E5] bg-[#EEF2FF]/40 ring-2 ring-[#4F46E5]/20 shadow-xs"
                      : "border-[#E5E7EB] bg-white hover:border-[#4F46E5]/40"
                  } p-2.5 sm:p-4 text-left transition-all min-w-0 cursor-pointer`}
                  style={{ boxShadow: "0 8px 24px rgba(15,23,42,0.03)" }}
                >
                  <div
                    className="flex size-9 sm:size-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    <IconComp className="size-4 sm:size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] sm:text-xs text-[#94A3B8] truncate">
                      {cat.count} article{cat.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight className="hidden sm:block size-4 text-[#94A3B8] transition-all group-hover:translate-x-0.5 group-hover:text-[#4F46E5] shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  LATEST ARTICLES + SIDEBAR                                        */}
      {/* ================================================================ */}
      <section id="latest-articles" className="bg-[#F8FAFF] px-3.5 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <SectionTag>All Posts</SectionTag>
            <SectionTitle>Latest Articles</SectionTitle>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 no-scrollbar [&>*]:shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "border border-[#E5E7EB] bg-white text-[#475569] hover:border-[#4F46E5]/40"
                }`}
              >
                All Posts
              </button>
              {displayCategories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === c.name ? "All" : c.name)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === c.name
                      ? "bg-[#4F46E5] text-white shadow-xs"
                      : "border border-[#E5E7EB] bg-white text-[#475569] hover:border-[#4F46E5]/40"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Reset indicator */}
            {(selectedCategory !== "All" || searchQuery) && (
              <button
                type="button"
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="inline-flex items-center gap-1 text-xs text-[#4F46E5] font-medium hover:underline self-end sm:self-center shrink-0 cursor-pointer"
              >
                <X className="size-3" /> Clear filters
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-10">
            {/* ---------- Articles grid ---------- */}
            <div className="lg:col-span-2">
              {filteredArticles.length > 0 ? (
                <div className="grid gap-3.5 sm:gap-5 sm:grid-cols-2 [&>*]:min-w-0">
                  {filteredArticles.map((a: ArticleData, i: number) => (
                    <Link key={a.slug || a.title} href={`/blog/${a.slug}`} className="block group min-w-0">
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{ duration: 0.4, delay: i * 0.04 }}
                        className="group flex flex-col h-full rounded-2xl sm:rounded-3xl border border-[#E5E7EB] bg-white overflow-hidden transition-all hover:shadow-lg hover:border-[#4F46E5]/30 hover:-translate-y-0.5"
                        style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}
                      >
                        <div className="relative h-40 sm:h-48 w-full bg-[#EEF2FF] overflow-hidden">
                          {a.coverImage ? (
                            <img
                              src={a.coverImage}
                              alt={`${a.title} cover image`}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#4F46E5]">
                              <Sparkles className="size-8 opacity-40" />
                            </div>
                          )}
                          <span className="absolute left-3 top-3 inline-flex rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#4F46E5] shadow-xs backdrop-blur-xs">
                            {a.cat}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-3.5 sm:p-5">
                          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#4F46E5] transition-colors">
                            {a.title}
                          </h3>
                          <p className="mt-1.5 text-xs sm:text-sm text-[#475569] leading-relaxed line-clamp-2">
                            {a.desc}
                          </p>
                          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#94A3B8]">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-[#4F46E5]" /> {a.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 text-[#4F46E5]" /> {a.time}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 sm:p-12 text-center">
                  <p className="text-sm sm:text-base font-semibold text-[#0F172A]">No articles found</p>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">Try adjusting your search query or selecting a different category.</p>
                  <button
                    type="button"
                    onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#4338CA] transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* ---------- Sidebar ---------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Popular Comparisons */}
              <div className="rounded-2xl sm:rounded-3xl border border-[#E5E7EB] bg-white p-4 sm:p-6" style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}>
                <h4 className="text-sm sm:text-base font-bold text-[#0F172A]">Popular Comparisons</h4>
                <div className="mt-3 space-y-1">
                  {popularComparisons.map((c) => (
                    <Link
                      key={c}
                      href="/compare"
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs sm:text-sm text-[#475569] hover:bg-[#F8FAFF] hover:text-[#4F46E5] transition-colors"
                    >
                      <span className="truncate">{c}</span>
                      <ChevronRight className="size-3.5 text-[#94A3B8] shrink-0" />
                    </Link>
                  ))}
                </div>
                <Link
                  href="/compare"
                  className="mt-4 block w-full text-center rounded-xl sm:rounded-2xl border border-[#E5E7EB] bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#4F46E5] shadow-xs hover:bg-[#F8FAFF] transition-colors"
                >
                  View All Comparisons
                </Link>
              </div>

              {/* Trending Tools */}
              <div className="rounded-2xl sm:rounded-3xl border border-[#E5E7EB] bg-white p-4 sm:p-6" style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}>
                <h4 className="text-sm sm:text-base font-bold text-[#0F172A]">Trending Tools</h4>
                <div className="mt-3 space-y-1">
                  {trendingToolsItems.map((t) => (
                    <Link
                      key={t}
                      href={`/discover?search=${encodeURIComponent(t)}`}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs sm:text-sm text-[#475569] hover:bg-[#F8FAFF] hover:text-[#4F46E5] transition-colors"
                    >
                      <span className="truncate">{t}</span>
                      <ChevronRight className="size-3.5 text-[#94A3B8] shrink-0" />
                    </Link>
                  ))}
                </div>
                <Link
                  href="/discover"
                  className="mt-4 block w-full text-center rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-[#4F46E5]/25"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #6D5DF6)" }}
                >
                  Explore AI Tools
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  NEWSLETTER CTA                                                   */}
      {/* ================================================================ */}
      <section id="nl-cta" className="px-3.5 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div
          className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl px-4 py-8 sm:px-12 sm:py-16 lg:px-16"
          style={{ background: "linear-gradient(135deg, #5B4CF6, #7C3AED)" }}
        >
          {/* decorative glow */}
          <div className="pointer-events-none absolute -top-40 -right-40 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] rounded-full bg-white/15 blur-[80px] sm:blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] rounded-full bg-white/10 blur-[60px] sm:blur-[100px]" />

          <div className="relative grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
            {/* ---------- Left ---------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white">
                Want the best AI tools, news &amp; tips delivered to your inbox?
              </h2>
              <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm md:text-base leading-relaxed text-white/80">
                Join 15,000+ subscribers who get our weekly newsletter with
                curated AI tools, expert insights, and exclusive content.
              </p>

              <div className="mt-5 sm:mt-6 flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-xs sm:text-sm text-white outline-none placeholder:text-white/50 backdrop-blur-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => { if (!email) return; try { await api.subscribeNewsletter(email); toast.success("Subscribed!"); setEmail(""); } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Subscription failed"); } }}
                  className="rounded-xl sm:rounded-2xl bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-[#4F46E5] shadow-lg transition-shadow hover:shadow-white/25 cursor-pointer shrink-0"
                >
                  Subscribe
                </motion.button>
              </div>

              <p className="mt-3 flex items-center gap-2 text-[11px] sm:text-xs text-white/60">
                <Check className="size-3.5 text-[#22C55E]" />
                No spam. Unsubscribe anytime.
              </p>
            </motion.div>

            {/* ---------- Right (illustration) ---------- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative h-64 w-64">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 m-auto flex h-48 w-48 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
                >
                  <Mail className="size-16 text-white/80" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 14, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl"
                >
                  <Zap className="size-5 text-white" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-8 left-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl"
                >
                  <Star className="size-5 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  TRUST FEATURES                                                   */}
      {/* ================================================================ */}
      <section className="bg-white px-3.5 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <SectionTag>Why Trust Us</SectionTag>
          <SectionTitle>Trusted by Thousands</SectionTitle>

          <div className="mt-8 sm:mt-12 grid gap-3.5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl sm:rounded-3xl border border-[#E5E7EB] bg-white p-4 sm:p-6 text-left transition-shadow"
                style={{ boxShadow: "0 10px 30px rgba(15,23,42,0.04)" }}
              >
                <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-3.5 text-sm sm:text-base font-bold text-[#0F172A]">{f.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#475569]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </main>
    <SiteFooter />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Code,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Megaphone,
  Mic,
  Mail,
  Menu,
  X,
  Grid2x2,
  ArrowUp,
  Eye,
} from "lucide-react";
import { AuthMenu } from "../components/auth-menu";
import { ToolLogo } from "../components/ToolLogo";
import fluxLogo from "../assets/images/tool-flux.webp";
import codeLogo from "../assets/images/tool-codewhisper.webp";
import motionLogo from "../assets/images/tool-motionflow.webp";
import synthLogo from "../assets/images/tool-synth.webp";
import luminaLogo from "../assets/images/tool-lumina.webp";
import insightLogo from "../assets/images/tool-insight.webp";
import Link from "next/link";
import { api } from "../lib/api";
import { HeroSection } from "../components/HeroSection";

const AIToolsDirectory = dynamic(() => import("../components/AIToolsDirectory"), {
  loading: () => (
    <div className="mx-auto max-w-7xl min-h-[320px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
    </div>
  ),
});

const SiteFooter = dynamic(() => import("../components/ui/Footer"), {
  loading: () => <div className="mt-24 h-40 border-t border-border bg-muted/30" />,
});

export { SiteFooter };

type Pricing = "Free" | "Freemium" | "Paid";

const fallbackTrending = [
  {
    slug: "flux-studio",
    name: "Flux Studio",
    category: "Image Generation",
    logo: fluxLogo,
    pricing: "Free" as Pricing,
    rating: 4.9,
    reviews: 128,
    desc: "Create photorealistic imagery with the latest open-source generative model architecture.",
    website: "https://fluxstudio.ai",
  },
  {
    slug: "codewhisper",
    name: "CodeWhisper",
    category: "Developer Tools",
    logo: codeLogo,
    pricing: "Freemium" as Pricing,
    rating: 4.7,
    reviews: 850,
    desc: "Real-time code completion and security scanning across 15+ programming languages.",
    website: "https://codewhisper.dev",
  },
  {
    slug: "motionflow",
    name: "MotionFlow",
    category: "Video Editing",
    logo: motionLogo,
    pricing: "Paid" as Pricing,
    rating: 4.8,
    reviews: 312,
    desc: "Automate B-roll and subtitle generation with one-click cinematic style transfers.",
    website: "https://motionflow.ai",
  },
  {
    slug: "synthflow",
    name: "SynthFlow",
    category: "Voice Synthesis",
    logo: synthLogo,
    pricing: "Freemium" as Pricing,
    rating: 4.9,
    reviews: 421,
    desc: "Studio-quality voiceovers in seconds with realistic neural speech engines.",
    website: "https://synthflow.ai",
  },
  {
    slug: "lumina-script",
    name: "Lumina Script",
    category: "AI Writing",
    logo: luminaLogo,
    pricing: "Free" as Pricing,
    rating: 4.6,
    reviews: 198,
    desc: "Long-form narrative consistency and world-building powered by orchestrated LLMs.",
    website: "https://luminascript.ai",
  },
  {
    slug: "insightlayer",
    name: "InsightLayer",
    category: "Analytics",
    logo: insightLogo,
    pricing: "Paid" as Pricing,
    rating: 4.8,
    reviews: 264,
    desc: "Turn complex business data into readable narratives and actionable reports automatically.",
    website: "https://insightlayer.ai",
  },
];

export let trending = fallbackTrending;

export const categories = [
  { slug: "ai-writing", name: "AI Writing", icon: Sparkles, count: 312 },
  { slug: "ai-image-generator", name: "Image Generation", icon: ImageIcon, count: 248 },
  { slug: "ai-video", name: "Video", icon: Video, count: 156 },
  { slug: "ai-coding", name: "Coding", icon: Code, count: 184 },
  { slug: "ai-productivity", name: "Productivity", icon: Zap, count: 421 },
  { slug: "ai-marketing", name: "Marketing", icon: Megaphone, count: 198 },
  { slug: "chatbots", name: "Chatbots", icon: MessageSquare, count: 142 },
  { slug: "ai-voice", name: "Voice & Audio", icon: Mic, count: 96 },
];

function PricingBadge({ pricing }: { pricing: Pricing }) {
  const styles =
    pricing === "Free" ? "bg-primary-muted text-primary" : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles}`}>
      {pricing}
    </span>
  );
}

function logoSrc(logo: unknown): string | undefined {
  if (typeof logo === "string") return logo;
  if (logo && typeof logo === "object" && "src" in (logo as { src?: string })) {
    return (logo as { src: string }).src;
  }
  return undefined;
}

export function ToolCard({ tool }: { tool: (typeof fallbackTrending)[number] & { upvotes?: number; clicks?: number } }) {
  const upvotes = Number((tool as any).upvotes || 0);
  const clicks = Number((tool as any).clicks || 0);

  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-md transition-all"
    >
      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 grid place-items-center mb-4">
        <ToolLogo name={tool.name} logo={logoSrc(tool.logo)} website={(tool as any).website} size={40} />
      </div>
      <h3 className="font-semibold text-gray-900 text-base leading-tight">{tool.name}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{tool.category}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-gray-800">{tool.rating}</span>
          <span className="text-xs text-gray-400">({tool.reviews})</span>
        </div>
        <div className="sm:self-auto self-start">
          <PricingBadge pricing={tool.pricing} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
          <ArrowUp className="h-3 w-3" />
          {upvotes >= 1000 ? `${(upvotes / 1000).toFixed(1).replace(/\.0$/, "")}k` : upvotes}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 font-medium text-slate-600">
          <Eye className="h-3 w-3" />
          {clicks >= 1000 ? `${(clicks / 1000).toFixed(1).replace(/\.0$/, "")}k` : clicks}
        </span>
      </div>
    </Link>
  );
}

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const preventBackgroundScroll = (event: Event) => event.preventDefault();
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });
    document.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
    });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      document.removeEventListener("wheel", preventBackgroundScroll);
    };
  }, [isOpen]);

  return (
    <>
    <nav
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled
          ? "border-border bg-white/95 shadow-sm backdrop-blur-md"
          : "border-border/60 bg-background/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0 shrink text-base font-bold tracking-tight text-primary sm:text-xl">
          Vault<span className="text-foreground"> of Tools</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/discover" className="hover:text-primary transition-colors">
            Discover
          </Link>
          <Link href="/categories" className="hover:text-primary transition-colors">
            Categories
          </Link>
          <Link href="/compare" className="hover:text-primary transition-colors">
            Compare
          </Link>
          <Link href="/toolsreview" className="hover:text-primary transition-colors">
            Tools reviews
          </Link>
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="/consulting" className="hover:text-primary transition-colors">
            Consulting
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/submit"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Submit Tool
          </Link>
          <AuthMenu />
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-muted md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </nav>
      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-x-0 bottom-0 top-16 touch-none md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/25"
            onClick={() => setIsOpen(false)}
          />
          <div
            data-testid="mobile-nav-panel"
            className="relative z-10 max-h-full overflow-y-auto overscroll-contain border-t border-border bg-background shadow-xl"
          >
            <div className="flex flex-col space-y-1 px-3 py-3">
            <Link href="/discover" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary">
              Discover
            </Link>
            <Link href="/categories" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary">
              Categories
            </Link>
            <Link href="/compare" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary">
              Compare
            </Link>
            <Link href="/toolsreview" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary">
              Tools reviews
            </Link>
            <Link href="/blog" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary">
              Blog
            </Link>
            <Link href="/consulting" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary">
              Consulting
            </Link>
            <Link href="/submit" onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary md:hidden">
              Submit Tool
            </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

interface ApiTool {
  slug: string;
  name: string;
  category: string;
  pricing: string;
  rating: number;
  reviews: number;
  desc: string;
  website: string;
}

export function HomePage() {
  const [tools, setTools] = useState(fallbackTrending);

  const fallbackComparisons = [
    { slug: "chatgpt-vs-claude", a: "ChatGPT", b: "Claude", category: "AI Chatbots" },
    { slug: "midjourney-vs-dall-e", a: "Midjourney", b: "DALL·E", category: "Image Generation" },
    { slug: "github-copilot-vs-cursor", a: "Copilot", b: "Cursor", category: "Coding" },
    { slug: "notion-ai-vs-mem", a: "Notion AI", b: "Mem", category: "Productivity" },
  ];

  const fallbackFaqs = [
    {
      q: "How do you choose which tools to list?",
      a: "Every tool is reviewed by our editorial team and the community. We prioritize tools that are actively maintained, well-documented, and solving real problems.",
    },
    { q: "Is Vault of Tools free to use?", a: "Yes — discovering, comparing, and reading reviews is completely free." },
    {
      q: "Can I submit my own AI tool?",
      a: "Absolutely. Use the Submit Tool button in the navigation. Submissions are reviewed within 48 hours.",
    },
    {
      q: "How often is the directory updated?",
      a: "New tools are added daily and existing listings are refreshed weekly to keep pricing and features accurate.",
    },
    {
      q: "Do I need an account to browse tools?",
      a: "No account is required to explore the directory. Creating an account unlocks additional features such as bookmarking and personalized recommendations.",
    },
    {
      q: "Can I compare multiple AI tools?",
      a: "Yes, you can compare features, pricing, ratings, and use cases to find the best tool for your needs.",
    },
    {
      q: "Are user reviews verified?",
      a: "We use moderation and automated checks to reduce spam and ensure reviews come from genuine users whenever possible.",
    },
    {
      q: "How can I report outdated information?",
      a: "Each tool page includes a feedback option where you can report incorrect pricing, broken links, or outdated features.",
    },
  ];

  const [comparisons, setComparisons] = useState(fallbackComparisons);
  const [faqs, setFaqs] = useState(fallbackFaqs);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.getHomeTrending(),
      api.getHomeComparisons(),
      api.getHomeFaqs(),
    ]).then(([toolsRes, comparisonsRes, faqsRes]) => {
      if (cancelled) return;

      if (toolsRes.status === "fulfilled" && Array.isArray(toolsRes.value) && toolsRes.value.length > 0) {
        const mapped = toolsRes.value.map((t: any) => {
          const fallback = fallbackTrending.find((f) => f.slug === t.slug);
          return {
            slug: t.slug,
            name: t.name,
            category: t.category,
            logo: t.logo || fallback?.logo || fluxLogo,
            pricing: t.pricing || "Free",
            rating: t.rating || 0,
            reviews: t.reviews || 0,
            desc: t.desc || "",
            website: t.website || "#",
            upvotes: t.upvotes || 0,
            clicks: t.clicks || 0,
          } as (typeof fallbackTrending)[number] & { upvotes: number; clicks: number };
        });
        setTools(mapped as any);
        trending = mapped as any;
      }

      if (comparisonsRes.status === "fulfilled" && Array.isArray(comparisonsRes.value) && comparisonsRes.value.length > 0) {
        setComparisons(comparisonsRes.value as unknown as typeof fallbackComparisons);
      }

      if (faqsRes.status === "fulfilled" && Array.isArray(faqsRes.value) && faqsRes.value.length > 0) {
        setFaqs(faqsRes.value as typeof fallbackFaqs);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />
      <HeroSection />
      <AIToolsDirectory />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-indigo-500" aria-hidden="true">
              <path
                d="M5 19L19 5M19 5H9M19 5V15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Trending AI Tools
          </h2>
          <Link href="/discover" className="flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-500 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {tools.slice(0, 6).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2">
          <Grid2x2 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-foreground">AI Categories</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="size-10 rounded-lg bg-primary-muted text-primary grid place-items-center group-hover:scale-105 transition-transform">
                <c.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.count} tools</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-soft py-20 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Side-by-side</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Compare AI models head to head
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Cannot decide? Our comparison engine breaks down pricing, context windows, and feature sets so you
                choose the right stack the first time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/compare/chatgpt-vs-claude"
                  className="rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-sm hover:bg-foreground/90 transition-all"
                >
                  Start a Comparison
                </Link>
                <Link
                  href="/discover"
                  className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-soft transition-all"
                >
                  View Popular Versus
                </Link>
              </div>
              <ul className="mt-8 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {comparisons.map((c, i) => (
                  <li key={c.slug || `cmp-${i}`}>
                    <Link
                      href={`/compare/${c.slug}`}
                      className="block rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      {c.a} <span className="text-muted-foreground">vs</span> {c.b}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-primary/5">
                <div className="grid grid-cols-2 border-b border-border pb-4">
                  <div className="min-w-0 break-words border-r border-border px-2 text-center text-xs font-semibold text-primary sm:px-4 sm:text-sm">ChatGPT-4o</div>
                  <div className="min-w-0 break-words px-2 text-center text-xs font-semibold text-foreground sm:px-4 sm:text-sm">Claude 3.5 Sonnet</div>
                </div>
                <div className="py-4 space-y-3">
                  {(
                    [
                      ["Knowledge Cutoff", "Oct 2023 vs Apr 2024"],
                      ["Context Window", "128k vs 200k"],
                      ["Pricing", "$20/mo vs $20/mo"],
                      ["Best For", "General vs Coding"],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-1 border-b border-border py-1 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="break-words text-left font-medium text-foreground sm:text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-primary/5 p-4 text-center text-xs font-semibold text-primary">
                  Winner: Claude 3.5 for Coding Tasks
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-100 bg-white px-6 py-8 sm:px-10 sm:py-10 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:text-left">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <Mail size={38} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                  Stay Updated With
                  <br />
                  The Latest AI Tools
                </h2>
                <p className="mt-3 max-w-md text-sm text-gray-500 sm:text-base">
                  Join our newsletter and get the best AI tools, news, and updates delivered to your inbox.
                </p>
              </div>
            </div>
            <div className="w-full max-w-xl">
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  aria-label="Email address"
                  className="w-full sm:flex-1 h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto h-12 rounded-xl bg-primary px-8 text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  Subscribe
                </button>
              </form>
              <p className="mt-3 text-xs text-gray-400">No spam, unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-card p-5 transition-shadow open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-foreground">
                {f.q}
                <span className="text-xl leading-none text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

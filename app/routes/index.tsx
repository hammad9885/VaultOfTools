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

const AIToolsDirectory = dynamic(
  () => import("../components/AIToolsDirectory"),
  {
    loading: () => (
      <div className="mx-auto min-h-80 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    ),
  }
);

const SiteFooter = dynamic(() => import("../components/ui/Footer"), {
  loading: () => (
    <div className="mt-24 h-40 border-t border-border bg-muted/30" />
  ),
});

export { SiteFooter };

type Pricing = "Free" | "Freemium" | "Paid";

type ToolExtras = {
  upvotes?: number;
  clicks?: number;
  tag?: string;
};

type ToolItem = Omit<
  (typeof fallbackTrending)[number],
  "logo" | "pricing"
> &
  ToolExtras & {
    logo: unknown;
    pricing: Pricing;
  };

type PromotedTool = ToolItem & {
  sponsored?: boolean;
  featured?: boolean;
};

type ApiTool = {
  slug: string;
  name: string;
  category: string;
  pricing?: string;
  rating?: number;
  reviews?: number;
  desc?: string;
  website?: string;
  logo?: unknown;
  upvotes?: number;
  clicks?: number;
  sponsored?: boolean;
  featured?: boolean;
};

type Comparison = {
  slug: string;
  a: string;
  b: string;
  category: string;
};

type FAQ = {
  q: string;
  a: string;
};

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
    website: "https://blackforestlabs.ai",
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
    website: "https://aws.amazon.com/codewhisperer",
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
    website: "https://runwayml.com",
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
    website: "https://elevenlabs.io",
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
    website: "https://sudowrite.com",
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
    website: "https://tableau.com",
  },
];

export let trending: ToolItem[] = fallbackTrending as ToolItem[];

export const categories = [
  {
    slug: "ai-writing",
    name: "AI Writing",
    icon: Sparkles,
    count: 312,
  },
  {
    slug: "ai-image-generator",
    name: "Image Generation",
    icon: ImageIcon,
    count: 248,
  },
  {
    slug: "ai-video",
    name: "Video",
    icon: Video,
    count: 156,
  },
  {
    slug: "ai-coding",
    name: "Coding",
    icon: Code,
    count: 184,
  },
  {
    slug: "ai-productivity",
    name: "Productivity",
    icon: Zap,
    count: 421,
  },
  {
    slug: "ai-marketing",
    name: "Marketing",
    icon: Megaphone,
    count: 198,
  },
  {
    slug: "chatbots",
    name: "Chatbots",
    icon: MessageSquare,
    count: 142,
  },
  {
    slug: "ai-voice",
    name: "Voice & Audio",
    icon: Mic,
    count: 96,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function getBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toApiTool(value: unknown): ApiTool | null {
  if (!isRecord(value)) {
    return null;
  }

  const slug = getString(value.slug);

  if (!slug) {
    return null;
  }

  return {
    slug,
    name: getString(value.name, "Untitled Tool"),
    category: getString(value.category, "AI Tools"),
    pricing: getString(value.pricing, "Free"),
    rating: getNumber(value.rating),
    reviews: getNumber(value.reviews),
    desc: getString(value.desc),
    website: getString(value.website, "#"),
    logo: value.logo,
    upvotes: getNumber(value.upvotes),
    clicks: getNumber(value.clicks),
    sponsored: getBoolean(value.sponsored),
    featured: getBoolean(value.featured),
  };
}

function normalizePricing(value: unknown): Pricing {
  if (value === "Paid") {
    return "Paid";
  }

  if (value === "Freemium") {
    return "Freemium";
  }

  return "Free";
}

function logoSrc(logo: unknown): string | undefined {
  if (typeof logo === "string") {
    return logo;
  }

  if (
    logo &&
    typeof logo === "object" &&
    "src" in logo &&
    typeof logo.src === "string"
  ) {
    return logo.src;
  }

  return undefined;
}

function PricingBadge({ pricing }: { pricing: Pricing }) {
  const styles =
    pricing === "Free"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
      : pricing === "Paid"
        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
        : "bg-indigo-50 text-indigo-700 border border-indigo-200/60";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide sm:px-2 sm:text-[10.5px] ${styles}`}
    >
      {pricing}
    </span>
  );
}

export function ToolCard({ tool }: { tool: ToolItem }) {
  const upvotes = Number(tool.upvotes ?? 0);
  const clicks = Number(tool.clicks ?? 0);

  const formatCount = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }

    return value;
  };

  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group flex h-full min-w-0 flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg sm:p-4"
    >
      <div>
        <div className="mb-2 flex items-start justify-between gap-1.5 sm:mb-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-gray-150 bg-gray-50/80 shadow-xs transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
            <ToolLogo
              name={tool.name}
              logo={logoSrc(tool.logo)}
              website={tool.website}
              size={24}
            />
          </div>

          <div className="flex flex-col items-end gap-1">
            {tool.tag && (
              <span
                className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider sm:px-2 sm:text-[9.5px] ${
                  tool.tag === "Sponsored"
                    ? "border border-amber-200/60 bg-amber-100 text-amber-700"
                    : "border border-violet-200/60 bg-violet-100 text-violet-700"
                }`}
              >
                {tool.tag === "Sponsored" && (
                  <Megaphone className="h-2.5 w-2.5" />
                )}
                {tool.tag}
              </span>
            )}

            <PricingBadge pricing={normalizePricing(tool.pricing)} />
          </div>
        </div>

        <div className="min-w-0">
          <h3
            className="truncate text-xs font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary sm:text-sm md:text-[15px]"
            title={tool.name}
          >
            {tool.name}
          </h3>

          <p
            className="mt-0.5 truncate text-[10px] font-normal text-gray-500 sm:text-xs"
            title={tool.category}
          >
            {tool.category}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-gray-100/90 pt-2">
        <div className="flex min-w-0 items-center gap-1">
          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400 sm:h-3.5 sm:w-3.5" />

          <span className="text-[11px] font-bold text-gray-800 sm:text-xs">
            {tool.rating}
          </span>

          <span className="hidden truncate text-[9.5px] text-gray-400 min-[380px]:inline sm:text-[10.5px]">
            ({tool.reviews})
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-[9.5px] text-gray-500 sm:text-[10.5px]">
          <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
            <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {formatCount(upvotes)}
          </span>

          <span className="hidden items-center gap-0.5 rounded-md bg-slate-50 px-1.5 py-0.5 font-medium text-slate-600 min-[380px]:inline-flex">
            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {formatCount(clicks)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
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
          <Link
            href="/"
            className="shrink-0 text-base font-bold tracking-tight text-primary sm:text-xl"
          >
            Vault
            <span className="text-foreground"> of Tools</span>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link
              href="/"
              className="font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>

            <Link
              href="/discover"
              className="transition-colors hover:text-primary"
            >
              Discover
            </Link>

            <Link
              href="/categories"
              className="transition-colors hover:text-primary"
            >
              Categories
            </Link>

            <Link
              href="/compare"
              className="transition-colors hover:text-primary"
            >
              Compare
            </Link>

            <Link
              href="/toolsreview"
              className="transition-colors hover:text-primary"
            >
              Tools reviews
            </Link>

            <Link
              href="/blog"
              className="transition-colors hover:text-primary"
            >
              Blog
            </Link>

            <Link
              href="/consulting"
              className="transition-colors hover:text-primary"
            >
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
              onClick={() => setIsOpen((value) => !value)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 top-16 z-[60] md:hidden">
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
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary"
                >
                  Home
                </Link>

                <Link
                  href="/discover"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary"
                >
                  Discover
                </Link>

                <Link
                  href="/categories"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary"
                >
                  Categories
                </Link>

                <Link
                  href="/compare"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary"
                >
                  Compare
                </Link>

                <Link
                  href="/toolsreview"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary"
                >
                  Tools reviews
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary"
                >
                  Blog
                </Link>

                <Link
                  href="/consulting"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary"
                >
                  Consulting
                </Link>

                <Link
                  href="/submit"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted hover:text-primary md:hidden"
                >
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

export function HomePage() {
  const [tools, setTools] = useState<ToolItem[]>(fallbackTrending);
  const [promoted, setPromoted] = useState<PromotedTool[]>([]);

  const fallbackComparisons: Comparison[] = [
    {
      slug: "chatgpt-vs-claude",
      a: "ChatGPT",
      b: "Claude",
      category: "AI Chatbots",
    },
    {
      slug: "midjourney-vs-dalle",
      a: "Midjourney",
      b: "DALL·E",
      category: "Image Generation",
    },
    {
      slug: "copilot-vs-cursor",
      a: "Copilot",
      b: "Cursor",
      category: "Coding",
    },
    {
      slug: "notion-ai-vs-mem",
      a: "Notion AI",
      b: "Mem",
      category: "Productivity",
    },
  ];

  const fallbackFaqs: FAQ[] = [
    {
      q: "How do you choose which tools to list?",
      a: "Every tool is reviewed by our editorial team and the community. We prioritize tools that are actively maintained, well-documented, and solving real problems.",
    },
    {
      q: "Is Vault of Tools free to use?",
      a: "Yes — discovering, comparing, and reading reviews is completely free.",
    },
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

  const [comparisons, setComparisons] =
    useState<Comparison[]>(fallbackComparisons);

  const [faqs, setFaqs] = useState<FAQ[]>(fallbackFaqs);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.getHomeTrending(),
      api.getHomePromoted(),
      api.getHomeComparisons(),
      api.getHomeFaqs(),
    ]).then(
      ([toolsRes, promotedRes, comparisonsRes, faqsRes]) => {
        if (cancelled) {
          return;
        }

        if (
          toolsRes.status === "fulfilled" &&
          Array.isArray(toolsRes.value) &&
          toolsRes.value.length > 0
        ) {
          const mapped: ToolItem[] = toolsRes.value
            .map((item: unknown): ToolItem | null => {
              const tool = toApiTool(item);

              if (!tool) {
                return null;
              }

              const fallback = fallbackTrending.find(
                (entry) => entry.slug === tool.slug
              );

              return {
                slug: tool.slug,
                name: tool.name,
                category: tool.category,
                logo: tool.logo || fallback?.logo || fluxLogo,
                pricing: normalizePricing(tool.pricing),
                rating: tool.rating ?? 0,
                reviews: tool.reviews ?? 0,
                desc: tool.desc ?? "",
                website: tool.website || "#",
                upvotes: tool.upvotes ?? 0,
                clicks: tool.clicks ?? 0,
              };
            })
            .filter(
              (tool): tool is ToolItem => tool !== null
            );

          if (mapped.length > 0) {
            setTools(mapped);
            trending = mapped;
          }
        }

        if (
          promotedRes.status === "fulfilled" &&
          Array.isArray(promotedRes.value) &&
          promotedRes.value.length > 0
        ) {
          const mappedPromoted: PromotedTool[] = promotedRes.value
            .map((item: unknown): PromotedTool | null => {
              const tool = toApiTool(item);

              if (!tool) {
                return null;
              }

              const fallback = fallbackTrending.find(
                (entry) => entry.slug === tool.slug
              );

              return {
                slug: tool.slug,
                name: tool.name,
                category: tool.category,
                logo: tool.logo || fallback?.logo || fluxLogo,
                pricing: normalizePricing(tool.pricing),
                rating: tool.rating ?? 0,
                reviews: tool.reviews ?? 0,
                desc: tool.desc ?? "",
                website: tool.website || "#",
                upvotes: tool.upvotes ?? 0,
                clicks: tool.clicks ?? 0,
                sponsored: tool.sponsored,
                featured: tool.featured,
              };
            })
            .filter(
              (tool): tool is PromotedTool => tool !== null
            );

          setPromoted(mappedPromoted);
        }

        if (
          comparisonsRes.status === "fulfilled" &&
          Array.isArray(comparisonsRes.value) &&
          comparisonsRes.value.length > 0
        ) {
          const mappedComparisons = comparisonsRes.value
            .map((item: unknown): Comparison | null => {
              if (!isRecord(item)) {
                return null;
              }

              const slug = getString(item.slug);

              if (!slug) {
                return null;
              }

              return {
                slug,
                a: getString(item.a),
                b: getString(item.b),
                category: getString(item.category),
              };
            })
            .filter(
              (item): item is Comparison => item !== null
            );

          if (mappedComparisons.length > 0) {
            setComparisons(mappedComparisons);
          }
        }

        if (
          faqsRes.status === "fulfilled" &&
          Array.isArray(faqsRes.value) &&
          faqsRes.value.length > 0
        ) {
          const mappedFaqs = faqsRes.value
            .map((item: unknown): FAQ | null => {
              if (!isRecord(item)) {
                return null;
              }

              const q = getString(item.q);
              const a = getString(item.a);

              if (!q || !a) {
                return null;
              }

              return {
                q,
                a,
              };
            })
            .filter((item): item is FAQ => item !== null);

          if (mappedFaqs.length > 0) {
            setFaqs(mappedFaqs);
          }
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />

      <HeroSection />

      <AIToolsDirectory />

      {promoted.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 pt-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
              <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-600">
                <Megaphone className="h-4 w-4" />
              </span>
              Featured Tools
            </h2>

            <span className="text-xs font-medium text-muted-foreground">
              Paid placements — independent of organic trending &amp; popularity
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {promoted.map((tool) => (
              <ToolCard
                key={tool.slug}
                tool={{
                  ...tool,
                  tag: tool.sponsored ? "Sponsored" : "Featured",
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0 text-indigo-500"
              aria-hidden="true"
            >
              <path
                d="M5 19L19 5M19 5H9M19 5V15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Trending Tools
          </h2>

          <Link
            href="/discover?sort=trending"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-indigo-500 hover:underline sm:text-sm"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
          {tools.slice(0, 6).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex min-w-0 items-center gap-2 sm:mb-8">
          <Grid2x2 className="h-5 w-5 shrink-0 text-indigo-600 sm:h-7 sm:w-7" />

          <h2 className="text-xl font-bold text-foreground sm:text-3xl">
            Explore Tools by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md sm:p-4"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-muted text-primary transition-transform group-hover:scale-105 sm:size-10">
                <category.icon className="size-4 sm:size-5" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-foreground sm:text-sm">
                  {category.name}
                </div>

                <div className="text-[11px] text-muted-foreground sm:text-xs">
                  {category.count} tools
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 bg-surface-soft py-10 sm:mt-8 sm:py-20">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Side-by-side
              </span>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
                Compare AI models head to head
              </h2>

              <p className="mt-2.5 text-sm text-muted-foreground sm:mt-4 sm:text-lg">
                Cannot decide? Our comparison engine breaks down pricing,
                context windows, and feature sets so you choose the right stack
                the first time.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                <Link
                  href="/compare"
                  className="rounded-xl bg-foreground px-5 py-3 text-center text-sm font-semibold text-background shadow-sm transition-all hover:bg-foreground/90"
                >
                  Start a Comparison
                </Link>

                <Link
                  href="/compare#popular-comparisons"
                  className="rounded-xl border border-border bg-card px-5 py-3 text-center text-sm font-semibold text-foreground transition-all hover:bg-surface-soft"
                >
                  View Popular Versus
                </Link>
              </div>

              <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-8">
                {comparisons.map((comparison, index) => (
                  <li
                    key={
                      comparison.slug ||
                      `cmp-${index}`
                    }
                  >
                    <Link
                      href={`/compare/${comparison.slug}`}
                      className="block truncate rounded-lg border border-border bg-card px-3 py-2 text-xs transition-colors hover:border-primary/30 hover:text-primary sm:text-sm"
                    >
                      {comparison.a}{" "}
                      <span className="text-muted-foreground">
                        vs
                      </span>{" "}
                      {comparison.b}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xl shadow-primary/5 sm:p-5">
                <div className="grid grid-cols-2 items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-primary-muted/60 px-2.5 py-3 sm:gap-2 sm:px-3 sm:py-4">
                    <ToolLogo
                      name="ChatGPT-4o"
                      size={32}
                      className="rounded-lg"
                    />

                    <span className="w-full truncate px-1 text-center text-xs font-bold text-primary sm:text-sm">
                      ChatGPT-4o
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-soft px-2.5 py-3 sm:gap-2 sm:px-3 sm:py-4">
                    <ToolLogo
                      name="Claude 3.5 Sonnet"
                      size={32}
                      className="rounded-lg"
                    />

                    <span className="w-full truncate px-1 text-center text-xs font-bold text-foreground sm:text-sm">
                      Claude 3.5 Sonnet
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                  {[
                    {
                      label: "Context Window",
                      a: "128k",
                      b: "200k",
                      win: "b" as "a" | "b",
                    },
                    {
                      label: "Best For",
                      a: "General",
                      b: "Coding & Long-form",
                      win: "b" as "a" | "b",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-xl border border-border p-2.5 sm:p-3"
                    >
                      <div className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                        {row.label}
                      </div>

                      <div className="mt-1.5 grid grid-cols-2 gap-2 text-center sm:mt-2">
                        <span
                          className={`text-sm font-bold sm:text-base ${
                            row.win === "a"
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {row.a}
                        </span>

                        <span
                          className={`text-sm font-bold sm:text-base ${
                            row.win === "b"
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {row.b}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl bg-primary/5 p-3 text-center text-xs font-bold text-primary sm:mt-4 sm:p-4 sm:text-sm">
                  Winner: Claude 3.5

                  <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground sm:text-xs">
                    for Coding &amp; Long-form Tasks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-3 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <h2 className="text-center text-xl font-bold text-foreground sm:text-3xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-card p-3.5 transition-shadow open:shadow-md sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-semibold text-foreground sm:items-center">
                <span className="min-w-0 text-left text-xs sm:text-base">
                  {faq.q}
                </span>

                <span className="shrink-0 text-lg leading-none text-primary transition-transform group-open:rotate-45 sm:text-xl">
                  +
                </span>
              </summary>

              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}


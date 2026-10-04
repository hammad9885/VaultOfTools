"use client";

import { useState } from "react";
import {
  Search,
  Star,
  MoreVertical,
  Lock,
  Globe,
} from "lucide-react";
import { cn } from "../../lib/utils";

const BRAND_TABS = ["Overview", "Products", "Services", "Technology"] as const;
type BrandTab = (typeof BRAND_TABS)[number];

const DEFAULT_QUERY = "vault of tools";

const KEY_FACTS: Record<BrandTab, { label: string; value: string }[]> = {
  Overview: [
    { label: "Also known as", value: "VaultOfTools, VOT" },
    { label: "Overview", value: "Discover the best AI tools" },
    { label: "Industry", value: "Software & Internet" },
    { label: "Type of site", value: "Directory & Review Platform" },
  ],
  Products: [
    { label: "Top category", value: "AI Tool Directory" },
    { label: "AI tools indexed", value: "10K+" },
    { label: "Categories", value: "10+" },
    { label: "Comparison pages", value: "Head-to-head" },
  ],
  Services: [
    { label: "Tool reviews", value: "Community verified" },
    { label: "Side-by-side compare", value: "Free" },
    { label: "Tool submission", value: "Editorial review" },
    { label: "Newsletter", value: "Premium, weekly" },
  ],
  Technology: [
    { label: "Platform", value: "Next.js" },
    { label: "Search", value: "Faceted filtering" },
    { label: "Structured data", value: "JSON-LD / Schema.org" },
    { label: "Hosting", value: "Edge CDN + SSL" },
  ],
};

const SITELINKS = [
  { label: "Discover AI Tools", href: "discover" },
  { label: "Categories", href: "categories" },
  { label: "Compare AI", href: "compare" },
  { label: "Tool Reviews", href: "toolsreview" },
  { label: "Submit Tool", href: "submit" },
];

function KnowledgePanel({
  tab,
  onTabChange,
  query,
  onQueryChange,
  origin,
  logo,
  title,
  description,
  email,
}: {
  tab: BrandTab;
  onTabChange: (tab: BrandTab) => void;
  query: string;
  onQueryChange: (value: string) => void;
  origin: string;
  logo: string;
  title: string;
  description: string;
  email: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-[#f8f9fb] px-4 py-3">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#4285F4] text-[11px] font-bold text-white">
          G
        </span>
        <div className="flex h-9 flex-1 items-center gap-2 rounded-full border border-border bg-white px-3">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={DEFAULT_QUERY}
            aria-label="Preview search query"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <MoreVertical size={16} className="shrink-0 text-muted-foreground" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
          {BRAND_TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onTabChange(item)}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition",
                tab === item
                  ? "border-[#1a0dab] text-[#1a0dab]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={`${title} logo`}
            width={72}
            height={72}
            className="h-16 w-16 shrink-0 rounded-xl object-contain sm:h-[72px] sm:w-[72px]"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-lg font-medium text-[#202124]">{title}</span>
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Site
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span className="truncate">{origin.replace(/^https?:\/\//, "")}</span>
              <MoreVertical size={12} />
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="font-medium text-[#202124]">4.8</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className="fill-[#fbbc04] text-[#fbbc04]"
                  />
                ))}
              </span>
              <span className="text-muted-foreground">1.2K reviews</span>
            </div>

            <p className="mt-2 text-sm leading-6 text-[#4d5156]">{description}</p>

            <div className="mt-4 rounded-xl border border-border bg-[#f8f9fb] p-3 sm:p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Key facts
              </p>
              <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {KEY_FACTS[tab].map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="truncate text-sm text-[#202124]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                People also search for
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SITELINKS.map((link) => (
                  <span
                    key={link.href}
                    className="rounded-full border border-border px-3 py-1 text-xs text-[#1a0dab]"
                  >
                    {link.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Lock size={12} /> Secure site
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe size={12} /> {origin.replace(/^https?:\/\//, "")}
              </span>
              <span>Contact: {email}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Deep dive — search within Vault of Tools
          </p>
          <div className="mt-2 flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm text-muted-foreground">
            <Search size={14} className="shrink-0" />
            <span>
              {origin.replace(/^https?:\/\//, "")}/discover?q=
              {query.trim() || "{search_term_string}"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Powered by the WebSite <span className="font-medium">SearchAction</span> in your
            JSON-LD (<span className="font-medium">/discover?q=&#123;search_term_string&#125;</span>).
          </p>
        </div>
      </div>
    </div>
  );
}

export function SerpPreview() {
  const [tab, setTab] = useState<BrandTab>("Overview");
  const [query, setQuery] = useState(DEFAULT_QUERY);

  const origin =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "https://vaultoftools.com";
  const siteOrigin = process.env.NEXT_PUBLIC_BASE_URL || origin;

  return (
    <KnowledgePanel
      tab={tab}
      onTabChange={setTab}
      query={query}
      onQueryChange={setQuery}
      origin={siteOrigin}
      logo="/logos/vaultoftools.svg"
      title={SERP_TITLE}
      description={SERP_DESCRIPTION}
      email={SERP_EMAIL}
    />
  );
}

const SERP_TITLE = "Vault of Tools — Discover the Best AI Tools";
const SERP_DESCRIPTION =
  "Curated directory of AI tools. Discover, compare, and review the best AI tools for any workflow.";
const SERP_EMAIL = "vaultoftools@gmail.com";
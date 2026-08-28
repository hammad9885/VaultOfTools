import { connectDB, isDBConnected } from "../config/db";
import Tool from "../models/Tool";
import Category from "../models/Category";
import memoryStore from "./memoryStore";
import { staticToolCatalog } from "./static-tool-catalog";
import { getToolLogoCandidates, resolveToolDomain } from "../tool-logos";
import { getAllEngagement, trendScore } from "./tool-engagement";
import { getAllActivityBuckets, computeTrendScore } from "./tool-activity";
import type { IToolCompareData } from "../models/Tool";

export type PublicTool = {
  _id?: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  toolType?: string;
  logo: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  pricing: string;
  startingPrice?: string;
  billingPeriod?: string;
  freePlan?: boolean;
  freeTrial?: boolean;
  trialDuration?: string;
  rating: number;
  reviews: number;
  desc: string;
  shortDescription?: string;
  description?: string;
  website?: string;
  url?: string;
  features: string[];
  pros: string[];
  cons: string[];
  bestFor?: string;
  useCases?: string[];
  tags: string[];
  searchKeywords?: string[];
  alternatives?: string[];
  videoUrl?: string;
  screenshots?: string[];
  compare?: IToolCompareData;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  featured?: boolean;
  sponsored?: boolean;
  trending?: boolean;
  editorsChoice?: boolean;
  verified?: boolean;
  displayOrder?: number | null;
  status?: string;
  upvotes: number;
  clicks: number;
  trendScore: number;
  saves: number;
  isNew?: boolean;
  createdAt?: string | Date;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function hashScore(input: string, salt: number) {
  let hash = salt;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return 40 + (hash % 960);
}

/** Normalize any tool document (Mongo / memory / static) for public UI. */
export function normalizePublicTool(raw: any): PublicTool {
  const slug = String(raw?.slug || slugify(raw?.name || "")).trim();
  const name = String(raw?.name || slug).trim();
  const desc = String(
    raw?.desc ||
      raw?.shortDescription ||
      raw?.description ||
      raw?.fullDescription ||
      ""
  ).trim();
  const reviews = Number(raw?.reviews || 0);
  const rating = Number(raw?.rating || 0);
  const createdAt = raw?.createdAt ? new Date(raw.createdAt) : null;
  const isNew =
    Boolean(raw?.isNew) ||
    (createdAt ? Date.now() - createdAt.getTime() < 1000 * 60 * 60 * 24 * 30 : false);
  const rawWebsite = String(raw?.website || raw?.url || "").trim();
  const website =
    (rawWebsite && rawWebsite !== "#" ? rawWebsite : "") ||
    (resolveToolDomain(name) ? `https://${resolveToolDomain(name)}` : undefined);
  const logoCandidates = getToolLogoCandidates(name, raw?.logo || raw?.logoUrl, website);
  const clicks = Math.max(0, Number(raw?.clicks || 0));
  // Prefer real counters; soft-seed only when neither clicks nor upvotes exist yet.
  const hasLiveCounters =
    raw?.upvotes != null || raw?.clicks != null || Number(raw?.upvotes) > 0 || Number(raw?.clicks) > 0;
  const upvotes = Math.max(
    0,
    Number(
      raw?.upvotes != null
        ? raw.upvotes
        : hasLiveCounters
          ? 0
          : Math.max(Math.round(rating * 40), hashScore(slug, 7) % 120)
    )
  );

  return {
    _id: raw?._id ? String(raw._id) : undefined,
    slug,
    name,
    category: String(raw?.category || "Uncategorized"),
    subcategory: raw?.subcategory ? String(raw.subcategory) : undefined,
    toolType: raw?.toolType ? String(raw.toolType) : undefined,
    logo: logoCandidates[0] || String(raw?.logo || raw?.logoUrl || ""),
    logoUrl: raw?.logoUrl ? String(raw.logoUrl) : null,
    bannerUrl: raw?.bannerUrl ? String(raw.bannerUrl) : null,
    imageUrl: raw?.imageUrl ? String(raw.imageUrl) : null,
    pricing: String(raw?.pricing || "Free"),
    startingPrice: raw?.startingPrice ? String(raw.startingPrice) : undefined,
    billingPeriod: raw?.billingPeriod ? String(raw.billingPeriod) : undefined,
    freePlan: Boolean(raw?.freePlan),
    freeTrial: Boolean(raw?.freeTrial),
    trialDuration: raw?.trialDuration ? String(raw.trialDuration) : undefined,
    rating,
    reviews,
    desc,
    shortDescription: raw?.shortDescription || desc,
    description: raw?.description || raw?.fullDescription || desc,
    website,
    url: raw?.url || website,
    features: asArray(raw?.features),
    pros: asArray(raw?.pros),
    cons: asArray(raw?.cons),
    bestFor: raw?.bestFor ? String(raw.bestFor) : undefined,
    useCases: asArray(raw?.useCases),
    tags: asArray(raw?.tags),
    searchKeywords: asArray(raw?.searchKeywords),
    alternatives: asArray(raw?.alternatives),
    videoUrl: raw?.videoUrl ? String(raw.videoUrl) : undefined,
    screenshots: asArray(raw?.screenshots),
    compare: raw?.compare ? (raw.compare as any) : undefined,
    seoTitle: raw?.seoTitle ?? null,
    seoDescription: raw?.seoDescription ?? null,
    ogImage: raw?.ogImage ?? null,
    featured: Boolean(raw?.featured),
    sponsored: Boolean(raw?.sponsored),
    trending: Boolean(raw?.trending),
    editorsChoice: Boolean(raw?.editorsChoice),
    verified: Boolean(raw?.verified),
    displayOrder: raw?.displayOrder ?? null,
    status: raw?.status || "published",
    clicks,
    upvotes,
    trendScore: trendScore(clicks, upvotes),
    saves: Number(raw?.saves ?? Math.max(Math.round(reviews * 4), hashScore(slug, 13))),
    isNew,
    createdAt: raw?.createdAt,
  };
}

type ListOpts = {
  category?: string | null;
  search?: string | null;
  sort?: string | null;
  featured?: boolean;
  limit?: number;
  skip?: number;
  publishedOnly?: boolean;
};

function matchesSearch(tool: PublicTool, search: string) {
  const q = search.toLowerCase();
  return (
    tool.name.toLowerCase().includes(q) ||
    tool.desc.toLowerCase().includes(q) ||
    tool.slug.toLowerCase().includes(q) ||
    tool.category.toLowerCase().includes(q) ||
    tool.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    (tool.searchKeywords || []).some((kw) => kw.toLowerCase().includes(q))
  );
}

function sortTools(list: PublicTool[], sort?: string | null) {
  const next = list.slice();
  if (sort === "newest") {
    next.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } else if (sort === "name") {
    next.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "trending" || sort === "popular" || sort === "featured") {
    // Organic trending: score computed from recent views/visits/votes/searches.
    next.sort((a, b) => {
      if (b.trendScore !== a.trendScore) return b.trendScore - a.trendScore;
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    });
  } else {
    next.sort((a, b) => b.trendScore - a.trendScore || b.rating - a.rating || b.reviews - a.reviews);
  }
  return next;
}

export async function getMergedSiteTools(opts: { publishedOnly?: boolean } = {}): Promise<PublicTool[]> {
  await connectDB();
  const publishedOnly = opts.publishedOnly !== false;
  const bySlug = new Map<string, PublicTool>();
  const engagement = await getAllEngagement();

  for (const tool of staticToolCatalog) {
    bySlug.set(tool.slug, normalizePublicTool({ ...tool, status: "published" }));
  }

  if (isDBConnected()) {
    const dbTools = await Tool.find(publishedOnly ? { status: "published" } : {}).lean();
    for (const raw of dbTools) {
      const tool = normalizePublicTool(raw);
      if (tool.slug) bySlug.set(tool.slug, tool);
    }
  } else {
    const memoryTools = await memoryStore.getTools({});
    for (const raw of memoryTools) {
      if (publishedOnly && raw.status && raw.status !== "published") continue;
      const tool = normalizePublicTool(raw);
      if (tool.slug) bySlug.set(tool.slug, tool);
    }
  }

  // Overlay live engagement counters (clicks / upvotes) onto every tool.
  const activityMap = await getAllActivityBuckets();
  for (const [slug, tool] of bySlug.entries()) {
    const eng = engagement.get(slug);
    const buckets = activityMap.get(slug);
    const organic = buckets
      ? computeTrendScore(buckets, {
          rating: tool.rating,
          createdAt: tool.createdAt,
        })
      : trendScore(eng?.clicks || tool.clicks, eng?.upvotes || tool.upvotes);
    bySlug.set(slug, {
      ...tool,
      clicks: eng?.clicks ?? tool.clicks,
      upvotes: eng?.upvotes ?? tool.upvotes,
      trendScore: organic,
    });
  }

  return [...bySlug.values()];
}

function applyListOpts(all: PublicTool[], opts: ListOpts) {
  let next = all.slice();
  if (opts.featured) next = next.filter((t) => t.featured);
  if (opts.category) {
    const category = opts.category.toLowerCase();
    next = next.filter(
      (t) =>
        t.category.toLowerCase() === category ||
        t.category.toLowerCase().includes(category) ||
        slugify(t.category) === category
    );
  }
  if (opts.search) next = next.filter((t) => matchesSearch(t, opts.search!));
  next = sortTools(next, opts.sort || "rating");
  const total = next.length;
  const skip = opts.skip || 0;
  const limit = opts.limit || 50;
  return { tools: next.slice(skip, skip + limit), total };
}

export async function listPublicTools(opts: ListOpts = {}) {
  const all = await getMergedSiteTools({ publishedOnly: opts.publishedOnly !== false });
  return applyListOpts(all, opts);
}

export async function getPublicToolBySlug(slug: string) {
  const clean = decodeURIComponent(slug).trim().toLowerCase();
  const all = await getMergedSiteTools({ publishedOnly: true });
  return (
    all.find((tool) => tool.slug.toLowerCase() === clean) ||
    all.find((tool) => tool.slug.toLowerCase().replace(/_/g, "-") === clean) ||
    null
  );
}

export async function listPopularPublicTools(limit = 15) {
  const all = await listPublicTools({ sort: "trending", limit });
  return all.tools;
}

export async function listTrendingPublicTools(limit = 12) {
  return listPopularPublicTools(limit);
}

export async function listRecentPublicTools(limit = 15) {
  const result = await listPublicTools({ sort: "newest", limit });
  return result.tools.map((tool) => ({ ...tool, isNew: true }));
}

export async function listCategoryPublicTools(categoryKey: string, limit = 50) {
  const key = decodeURIComponent(categoryKey).trim();
  const byName = await listPublicTools({ category: key, sort: "popular", limit });
  if (byName.tools.length > 0) return byName.tools;

  // Allow slug-style keys like "customer-service-support"
  const slugKey = slugify(key);
  const broad = await listPublicTools({ sort: "popular", limit: 200 });
  return broad.tools
    .filter(
      (tool) =>
        slugify(tool.category) === slugKey ||
        tool.category.toLowerCase() === key.toLowerCase()
    )
    .slice(0, limit);
}

export async function listPublicCategories() {
  await connectDB();
  const tools = await getMergedSiteTools({ publishedOnly: true });
  const countByName = new Map<string, number>();
  for (const t of tools) {
    countByName.set(t.category, (countByName.get(t.category) ?? 0) + 1);
  }

  if (isDBConnected()) {
    try {
      const adminCategories = await Category.find().lean();
      const merged: Array<{
        name: string;
        slug: string;
        count: number;
        icon?: string | null;
        description?: string | null;
        key: string;
        label: string;
      }> = [];
      const seen = new Set<string>();

      for (const c of adminCategories) {
        const name = c.name;
        seen.add(name.toLowerCase());
        merged.push({
          name,
          slug: c.slug || slugify(name),
          count: countByName.get(name) ?? 0,
          icon: c.icon ?? null,
          description: c.description ?? null,
          key: name,
          label: name,
        });
      }

      for (const [name, count] of countByName.entries()) {
        if (seen.has(name.toLowerCase())) continue;
        merged.push({
          name,
          slug: slugify(name),
          count,
          key: name,
          label: name,
        });
      }

      merged.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      if (merged.length > 0) return merged;
    } catch {
      // fall through
    }
  }

  const memoryCats = await memoryStore.getCategories();
  if (memoryCats.length > 0) {
    return memoryCats.map((c: any) => ({
      name: c.name,
      slug: c.slug || slugify(c.name),
      count: countByName.get(c.name) || c.count || 0,
      key: c.name,
      label: c.name,
    }));
  }

  return [...countByName.entries()]
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      count,
      key: name,
      label: name,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function listPublicSearchTerms(limit = 12) {
  const [popular, categories] = await Promise.all([
    listPopularPublicTools(limit),
    listPublicCategories(),
  ]);
  const terms = [
    ...popular.map((t) => t.name),
    ...categories.slice(0, 6).map((c) => c.name),
  ];
  return [...new Set(terms)].slice(0, limit);
}

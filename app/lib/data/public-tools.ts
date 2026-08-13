import { connectDB, isDBConnected } from "../config/db";
import Tool from "../models/Tool";
import Category from "../models/Category";
import memoryStore from "./memoryStore";
import { staticToolCatalog } from "./static-tool-catalog";

export type PublicTool = {
  _id?: string;
  slug: string;
  name: string;
  category: string;
  logo: string;
  pricing: string;
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
  tags: string[];
  featured?: boolean;
  sponsored?: boolean;
  status?: string;
  upvotes: number;
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

  return {
    _id: raw?._id ? String(raw._id) : undefined,
    slug,
    name,
    category: String(raw?.category || "Uncategorized"),
    logo: String(raw?.logo || raw?.logoUrl || ""),
    pricing: String(raw?.pricing || "Free"),
    rating,
    reviews,
    desc,
    shortDescription: raw?.shortDescription || desc,
    description: raw?.description || raw?.fullDescription || desc,
    website: raw?.website || raw?.url || undefined,
    url: raw?.url || raw?.website || undefined,
    features: asArray(raw?.features),
    pros: asArray(raw?.pros),
    cons: asArray(raw?.cons),
    tags: asArray(raw?.tags),
    featured: Boolean(raw?.featured),
    sponsored: Boolean(raw?.sponsored),
    status: raw?.status || "published",
    upvotes: Number(raw?.upvotes ?? Math.max(reviews * 12, Math.round(rating * 180), hashScore(slug, 7))),
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
    tool.tags.some((tag) => tag.toLowerCase().includes(q))
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
  } else if (sort === "popular" || sort === "featured") {
    next.sort((a, b) => {
      const featuredDelta = Number(b.featured) - Number(a.featured);
      if (featuredDelta) return featuredDelta;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    });
  } else {
    next.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  }
  return next;
}

async function listFromDb(opts: ListOpts) {
  const publishedOnly = opts.publishedOnly !== false;
  const mongoFilter: Record<string, any> = {};
  if (publishedOnly) mongoFilter.status = "published";
  if (opts.featured) mongoFilter.featured = true;
  if (opts.category) {
    const category = opts.category.trim();
    mongoFilter.$or = [
      { category: { $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
      { category: { $regex: category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
    ];
  }
  if (opts.search) {
    const search = opts.search.trim();
    const searchOr = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { desc: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
    if (mongoFilter.$or) {
      mongoFilter.$and = [{ $or: mongoFilter.$or }, { $or: searchOr }];
      delete mongoFilter.$or;
    } else {
      mongoFilter.$or = searchOr;
    }
  }

  let sortObj: Record<string, 1 | -1> = { rating: -1, reviews: -1 };
  if (opts.sort === "newest") sortObj = { createdAt: -1 };
  if (opts.sort === "name") sortObj = { name: 1 };
  if (opts.sort === "popular" || opts.sort === "featured") {
    sortObj = { featured: -1, rating: -1, reviews: -1 };
  }

  const [items, total] = await Promise.all([
    Tool.find(mongoFilter)
      .sort(sortObj)
      .skip(opts.skip || 0)
      .limit(opts.limit || 50),
    Tool.countDocuments(mongoFilter),
  ]);

  return {
    tools: items.map(normalizePublicTool),
    total,
  };
}

async function listFromFallback(opts: ListOpts) {
  let all: PublicTool[] = [];
  const memoryTools = await memoryStore.getTools({});
  if (memoryTools.length > 0) {
    all = memoryTools.map(normalizePublicTool);
  } else {
    all = staticToolCatalog.map(normalizePublicTool);
  }

  if (opts.featured) all = all.filter((t) => t.featured);
  if (opts.category) {
    const category = opts.category.toLowerCase();
    all = all.filter(
      (t) =>
        t.category.toLowerCase() === category ||
        t.category.toLowerCase().includes(category) ||
        slugify(t.category) === category
    );
  }
  if (opts.search) all = all.filter((t) => matchesSearch(t, opts.search!));

  all = sortTools(all, opts.sort || "rating");
  const total = all.length;
  const skip = opts.skip || 0;
  const limit = opts.limit || 50;
  return { tools: all.slice(skip, skip + limit), total };
}

export async function listPublicTools(opts: ListOpts = {}) {
  await connectDB();
  if (isDBConnected()) {
    return listFromDb(opts);
  }
  return listFromFallback(opts);
}

export async function getPublicToolBySlug(slug: string) {
  await connectDB();
  const clean = decodeURIComponent(slug).trim();

  if (isDBConnected()) {
    const tool = await Tool.findOne({ slug: clean, status: "published" });
    return tool ? normalizePublicTool(tool) : null;
  }

  const memory = await memoryStore.getToolBySlug(clean);
  if (memory) return normalizePublicTool(memory);
  const staticHit = staticToolCatalog.find((t) => t.slug === clean);
  return staticHit ? normalizePublicTool(staticHit) : null;
}

export async function listPopularPublicTools(limit = 15) {
  const featured = await listPublicTools({
    sort: "popular",
    featured: true,
    limit,
  });
  if (featured.tools.length >= Math.min(limit, 5)) return featured.tools;

  const all = await listPublicTools({ sort: "popular", limit });
  return all.tools;
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

  if (isDBConnected()) {
    try {
      const [adminCategories, tools] = await Promise.all([
        Category.find().lean(),
        Tool.find({ status: "published" }, { category: 1, categoryId: 1 }).lean(),
      ]);

      const countByName = new Map<string, number>();
      const countById = new Map<string, number>();
      for (const t of tools) {
        if (t.category) {
          countByName.set(t.category, (countByName.get(t.category) ?? 0) + 1);
        }
        if (t.categoryId != null) {
          const id = String(t.categoryId);
          countById.set(id, (countById.get(id) ?? 0) + 1);
        }
      }

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
          count: countByName.get(name) ?? countById.get(String(c._id)) ?? 0,
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
      count: c.count || 0,
      key: c.name,
      label: c.name,
    }));
  }

  // Last-resort: derive categories from static catalog.
  const map = new Map<string, number>();
  for (const tool of staticToolCatalog) {
    map.set(tool.category, (map.get(tool.category) || 0) + 1);
  }
  return [...map.entries()]
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

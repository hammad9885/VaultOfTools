import {
  categoryToolMap,
  popularTools,
  recentTools,
} from "./categories";
import { resolveToolDomain } from "../tool-logos";
import { homepageFeaturedTools } from "./homepage-tools";

type SourceTool = {
  name: string;
  slug?: string;
  category?: string;
  desc?: string;
  tags?: string[];
  logo?: string | null;
  upvotes?: number;
  pricing?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
};

export type StaticCatalogTool = {
  _id: string;
  slug: string;
  name: string;
  category: string;
  logo: string | null;
  pricing: string;
  rating: number;
  reviews: number;
  clicks: number;
  upvotes: number;
  desc: string;
  website: string;
  tags: string[];
  features: string[];
  pros: string[];
  cons: string[];
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const sources: Array<{ category: string; tools: SourceTool[] }> = [
  {
    category: "Featured",
    tools: homepageFeaturedTools.map((t) => ({
      name: t.name,
      slug: t.slug,
      category: t.category,
      desc: t.desc,
      tags: t.tags,
      upvotes: t.upvotes,
      pricing: t.pricing,
      rating: t.rating,
      reviews: t.reviews,
      website: t.website,
      features: t.features,
      pros: t.pros,
      cons: t.cons,
    })),
  },
  ...Object.entries(categoryToolMap).map(([category, tools]) => ({
    category,
    tools: tools as SourceTool[],
  })),
  { category: "Popular AI Tools", tools: popularTools as SourceTool[] },
  { category: "Recently Added", tools: recentTools as SourceTool[] },
];

const seen = new Set<string>();

export const staticToolCatalog: StaticCatalogTool[] = sources.flatMap(
  ({ category, tools }) =>
    tools.flatMap((tool) => {
      const slug = (tool.slug || slugify(tool.name)).trim();
      if (!slug || seen.has(slug)) return [];
      seen.add(slug);
      const domain = resolveToolDomain(tool.name);
      return [
        {
          _id: `static-${slug}`,
          slug,
          name: tool.name,
          category: tool.category || category,
          logo: tool.logo || null,
          pricing: tool.pricing || "Freemium",
          rating: tool.rating ?? 4.5,
          reviews: tool.reviews ?? tool.upvotes ?? 0,
          clicks: 0,
          upvotes: tool.upvotes || 0,
          desc: tool.desc || "",
          website: tool.website || (domain ? `https://${domain}` : "#"),
          tags: tool.tags || [],
          features: tool.features || [],
          pros: tool.pros || [],
          cons: tool.cons || [],
        },
      ];
    })
);

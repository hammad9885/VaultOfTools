import {
  categoryToolMap,
  popularTools,
  recentTools,
} from "./categories";
import { resolveToolDomain } from "../tool-logos";

type SourceTool = {
  name: string;
  desc?: string;
  tags?: string[];
  logo?: string | null;
  upvotes?: number;
};

export type StaticCatalogTool = {
  _id: string;
  slug: string;
  name: string;
  category: string;
  logo: string | null;
  pricing: "Freemium";
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
      const slug = slugify(tool.name);
      if (!slug || seen.has(slug)) return [];
      seen.add(slug);
      return [
        {
          _id: `static-${slug}`,
          slug,
          name: tool.name,
          category,
          logo: tool.logo || null,
          pricing: "Freemium" as const,
          rating: 4.5,
          reviews: tool.upvotes || 0,
          clicks: 0,
          upvotes: tool.upvotes || 0,
          desc: tool.desc || "",
          website: resolveToolDomain(tool.name) ? `https://${resolveToolDomain(tool.name)}` : "#",
          tags: tool.tags || [],
          features: [],
          pros: [],
          cons: [],
        },
      ];
    })
);

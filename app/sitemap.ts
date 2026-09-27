import { MetadataRoute } from "next";
import { categories, categoryToolMap } from "@/app/lib/data/categories";
import { posts } from "@/app/lib/data/blog";
import { homepageFeaturedTools } from "@/app/lib/data/homepage-tools";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.BASE_URL || "https://vaultoftools.com";
  const now = new Date();

  // 1. Core indexable landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 2. Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {
      url: `${baseUrl}/category/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  const toolSlugs = new Set<string>();
  homepageFeaturedTools.forEach((t) => toolSlugs.add(t.slug));

  Object.values(categoryToolMap).forEach((list) => {
    list.forEach((item) => {
      const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      toolSlugs.add(slug);
    });
  });

  // 3. Head-to-head comparison routes
  const comparedToolSlugs = Array.from(toolSlugs).slice(0, 20);

  const comparisonSlugs: string[] = [];

  for (let index = 0; index < comparedToolSlugs.length; index += 1) {
    for (let secondIndex = index + 1; secondIndex < comparedToolSlugs.length; secondIndex += 1) {
      comparisonSlugs.push(
        `${comparedToolSlugs[index]}-vs-${comparedToolSlugs[secondIndex]}`
      );
    }
  }

  const comparisonRoutes: MetadataRoute.Sitemap = comparisonSlugs.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Blog post routes
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 5. Tool routes
  const toolRoutes: MetadataRoute.Sitemap = Array.from(toolSlugs).map((slug) => ({
    url: `${baseUrl}/tool/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Combine only canonical public URLs (strictly excludes /admin, /account, /api, /auth)
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...comparisonRoutes,
    ...blogRoutes,
    ...toolRoutes,
  ];
}

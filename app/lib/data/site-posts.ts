import { connectDB, isDBConnected } from "../config/db";
import BlogPost from "../models/BlogPost";
import { posts as staticPosts } from "./blog";
import memoryStore from "./memoryStore";

export type SitePost = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  coverImage?: string;
  date?: string;
  readTime?: string;
  featured: boolean;
  createdAt?: string | Date;
  source: "database" | "site";
};

function normalizePost(raw: any, source: SitePost["source"]): SitePost {
  const slug = String(raw?.slug || "").trim();
  return {
    _id: raw?._id ? String(raw._id) : `site-post-${slug}`,
    slug,
    title: String(raw?.title || slug),
    category: String(raw?.category || "General"),
    excerpt: raw?.excerpt || "",
    coverImage: raw?.coverImage,
    date: raw?.date,
    readTime: raw?.readTime,
    featured: Boolean(raw?.featured),
    createdAt: raw?.createdAt || raw?.date,
    source,
  };
}

export async function getMergedSitePosts(): Promise<SitePost[]> {
  await connectDB();
  const bySlug = new Map<string, SitePost>();

  for (const post of staticPosts) {
    if (!post.slug) continue;
    bySlug.set(post.slug, normalizePost(post, "site"));
  }

  if (isDBConnected()) {
    const dbPosts = await BlogPost.find().lean();
    for (const post of dbPosts) {
      const next = normalizePost(post, "database");
      if (next.slug) bySlug.set(next.slug, next);
    }
  } else {
    const memoryPosts = await memoryStore.getPosts({});
    for (const post of memoryPosts) {
      const next = normalizePost(post, "database");
      if (next.slug) bySlug.set(next.slug, next);
    }
  }

  return [...bySlug.values()].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.date || 0).getTime();
    const bTime = new Date(b.createdAt || b.date || 0).getTime();
    return bTime - aTime;
  });
}

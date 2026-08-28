"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteNav, SiteFooter, ToolCard, trending as fallbackTrending } from "../../routes/index";
import { api } from "../../lib/api";
import Link from "next/link";
import { Layers } from "lucide-react";

function titleFromSlug(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [categoryName, setCategoryName] = useState(titleFromSlug(slug));
  const [count, setCount] = useState(0);
  const [fetchedTools, setFetchedTools] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.getCategories().catch(() => []),
      api.getCategoryTools(slug).catch(() => []),
      api.getTools({ category: titleFromSlug(slug), limit: 50 }).catch(() => ({ tools: [] })),
    ])
      .then(([categories, categoryTools, toolsRes]) => {
        if (cancelled) return;
        const match = (Array.isArray(categories) ? categories : []).find(
          (c: any) =>
            c.slug === slug ||
            String(c.name || "").toLowerCase().replace(/\s+/g, "-") === slug
        );
        const name = match?.name || titleFromSlug(slug);
        setCategoryName(name);

        const fromCategory = Array.isArray(categoryTools) ? categoryTools : [];
        const fromToolsApi = Array.isArray(toolsRes?.tools) ? toolsRes.tools : [];
        const list = fromCategory.length > 0 ? fromCategory : fromToolsApi;
        setFetchedTools(list);
        setCount(match?.count ?? list.length);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fallback = fallbackTrending.filter((t) =>
    t.category.toLowerCase().includes(categoryName.toLowerCase().split(" ")[0] || "")
  );
  const list =
    fetchedTools && fetchedTools.length > 0
      ? fetchedTools
      : loading
        ? []
        : fallback.length
          ? fallback
          : fallbackTrending;

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link> /{" "}
          <Link href="/categories" className="hover:text-primary">Categories</Link> /{" "}
          <span className="text-foreground">{categoryName}</span>
        </nav>
        <header className="mb-10">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-primary-muted text-primary grid place-items-center">
              <Layers className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                Best {categoryName} Tools
              </h1>
              <p className="text-muted-foreground mt-1">
                {count || list.length} tools • curated and reviewed
              </p>
            </div>
          </div>
        </header>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tools…</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t: any) => (
              <ToolCard key={t.slug || t.name} tool={t} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { SiteNav, SiteFooter, ToolCard, trending as fallbackTrending, categories } from "../../routes/index";
import { api } from "../../lib/api";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const cat = categories.find((c) => c.slug === params.slug);
  const [fetchedTools, setFetchedTools] = useState<any[] | null>(null);

  useEffect(() => {
    api.getCategoryTools(params.slug)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFetchedTools(data);
        }
      })
      .catch(() => {});
  }, [params.slug]);

  if (!cat) return notFound();

  const fallback = fallbackTrending.filter((t) =>
    t.category.toLowerCase().includes(cat.name.toLowerCase().split(" ")[0])
  );
  const list = fetchedTools ?? (fallback.length ? fallback : fallbackTrending);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link> /{" "}
          <Link href="/categories" className="hover:text-primary">Categories</Link> /{" "}
          <span className="text-foreground">{cat.name}</span>
        </nav>
        <header className="mb-10">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-primary-muted text-primary grid place-items-center">
              <cat.icon className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Best {cat.name} Tools</h1>
              <p className="text-muted-foreground mt-1">{cat.count} tools • curated and reviewed</p>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

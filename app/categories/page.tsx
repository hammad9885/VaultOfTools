"use client";

import { useEffect, useState } from "react";
import { SiteNav, SiteFooter, categories as fallbackCategories } from "@/app/routes/index";
import { api } from "@/app/lib/api";
import Link from "next/link";
import {
  Sparkles, Image as ImageIcon, Video, MessageSquare,
  Megaphone, Mic, Code, Zap, Layers,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  image: ImageIcon,
  video: Video,
  "message-square": MessageSquare,
  megaphone: Megaphone,
  mic: Mic,
  code: Code,
  zap: Zap,
};

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CategoriesPage() {
  const [fetched, setFetched] = useState<any[] | null>(null);

  useEffect(() => {
    api.getCategories()
      .then((data) => {
        if (data && data.length > 0) {
          setFetched(data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = fetched ?? fallbackCategories;

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-5xl">
            Browse all categories
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Specialized AI tools for every workflow. Pick a category to explore.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {categories.map((c) => {
            const Icon = typeof c.icon === "string"
              ? (iconMap[c.icon.toLowerCase()] ?? Layers)
              : c.icon;
            const slug = c.slug ?? slugify(c.name);
            const count = c.count ?? 0;
            return (
              <Link
                key={slug}
                href={`/category/${slug}`}
                className="group flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 transition-all hover:border-primary/30 hover:shadow-md sm:gap-4 sm:p-5"
              >
                <div className="size-11 sm:size-14 rounded-xl bg-primary-muted text-primary grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="size-5 sm:size-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-sm sm:text-base text-foreground truncate">{c.name}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {count} curated tools
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

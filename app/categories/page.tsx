"use client";

import { useEffect, useState } from "react";
import { SiteNav, SiteFooter, categories as fallbackCategories } from "@/app/routes/index";
import { api } from "@/app/lib/api";
import Link from "next/link";
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Megaphone,
  Mic,
  Code,
  Zap,
  Layers,
  Brain,
  FileText,
  Music,
  Database,
  Search,
  Bot,
  Folder,
  Palette,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  image: ImageIcon,
  "image-icon": ImageIcon,
  video: Video,
  "message-square": MessageSquare,
  messagesquare: MessageSquare,
  megaphone: Megaphone,
  mic: Mic,
  code: Code,
  zap: Zap,
  brain: Brain,
  filetext: FileText,
  "file-text": FileText,
  music: Music,
  database: Database,
  search: Search,
  bot: Bot,
  folder: Folder,
  palette: Palette,
  layers: Layers,
};

const slugToIcon: Record<string, LucideIcon> = {
  "ai-writing": Sparkles,
  writing: Sparkles,
  copywriting: Sparkles,
  content: FileText,
  "ai-image-generator": ImageIcon,
  "image-generation": ImageIcon,
  images: ImageIcon,
  art: Palette,
  design: Palette,
  "ai-video": Video,
  video: Video,
  animation: Video,
  "ai-coding": Code,
  coding: Code,
  code: Code,
  developer: Code,
  "ai-productivity": Zap,
  productivity: Zap,
  workflow: Zap,
  automation: Zap,
  "ai-marketing": Megaphone,
  marketing: Megaphone,
  seo: Search,
  chatbots: MessageSquare,
  chatbot: MessageSquare,
  chat: MessageSquare,
  "customer-support": MessageSquare,
  "ai-voice": Mic,
  voice: Mic,
  audio: Mic,
  music: Music,
  research: Search,
  data: Database,
  analytics: Database,
};

function renderCategoryIcon(c: any) {
  // 1. If it's already a valid React component function/object
  if (c.icon && (typeof c.icon === "function" || (typeof c.icon === "object" && "$$typeof" in c.icon))) {
    const Component = c.icon;
    return <Component className="size-5 sm:size-6" />;
  }

  // 2. If it's an image URL / path
  if (typeof c.icon === "string" && (c.icon.startsWith("http") || c.icon.startsWith("/") || c.icon.startsWith("data:image"))) {
    return <img src={c.icon} alt={c.name || "Category"} className="size-5 sm:size-6 object-contain" />;
  }

  // 3. If it's a string matching iconMap
  if (typeof c.icon === "string" && c.icon.trim()) {
    const key = c.icon.toLowerCase().trim();
    if (iconMap[key]) {
      const Component = iconMap[key];
      return <Component className="size-5 sm:size-6" />;
    }
  }

  // 4. Match by slug
  const slug = (c.slug || "").toLowerCase().trim();
  if (slug && slugToIcon[slug]) {
    const Component = slugToIcon[slug];
    return <Component className="size-5 sm:size-6" />;
  }

  // 5. Match by name keyword
  const name = (c.name || "").toLowerCase();
  for (const [key, icon] of Object.entries(slugToIcon)) {
    if (name.includes(key.replace("ai-", ""))) {
      const Component = icon;
      return <Component className="size-5 sm:size-6" />;
    }
  }

  // 6. Guaranteed safe fallback
  return <Layers className="size-5 sm:size-6" />;
}

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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 [&>*]:min-w-0">
          {categories.map((c) => {
            const slug = c.slug ?? slugify(c.name || "");
            const count = c.count ?? c.toolCount ?? 0;
            return (
              <Link
                key={slug}
                href={`/category/${slug}`}
                className="group flex items-center gap-2.5 sm:gap-4 rounded-2xl border border-border bg-card p-3 sm:p-5 transition-all hover:border-primary/30 hover:shadow-md min-w-0"
              >
                <div className="size-10 sm:size-14 rounded-xl bg-primary-muted text-primary grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                  {renderCategoryIcon(c)}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-xs sm:text-base text-foreground truncate">{c.name}</h2>
                  <p className="text-[11px] sm:text-sm text-muted-foreground truncate">
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

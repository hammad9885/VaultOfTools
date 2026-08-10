"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SearchBar } from "./ui/SearchBar";
import heroBg from "../assets/images/HeroSection.webp";

const StatsSection = dynamic(() => import("./ui/CountUp"), {
  ssr: false,
  loading: () => (
    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-175 mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[68px] rounded-2xl border border-border bg-card/40 animate-pulse" />
      ))}
    </div>
  ),
});

export function HeroSection() {
  const [searchTerms, setSearchTerms] = useState<string[]>([
    "AI Writing",
    "AI Image",
    "AI Video",
    "AI Coding",
    "Chatbots",
  ]);

  useEffect(() => {
    fetch("/api/static/explore/search-terms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) setSearchTerms(data);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="relative overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-20 lg:pt-10 lg:pb-24">
      <div className="absolute inset-0 -z-20">
        <Image
          src={heroBg}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={70}
          className="object-cover object-center"
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-sm" />

      <div className="absolute top-10 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
          Welcome to Vault of Tools <Sparkles className="size-4" />
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
          Discover The Best <br />
          <span className="text-primary">AI Tools</span> For Every Need
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          Find, compare and review the world best AI tools all in one smart
          directory.
        </p>

        <div className="mx-auto mt-8 max-w-4xl">
          <SearchBar />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              Popular:
            </span>

            {searchTerms.map((item) => (
              <Link
                key={item}
                href={`/discover?q=${encodeURIComponent(item)}`}
                className="rounded-full border px-3 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <StatsSection />
      </div>
    </header>
  );
}

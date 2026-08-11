"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "./ui/SearchBar";
import heroBg from "../assets/images/HeroSection.webp";

const StatsSection = dynamic(() => import("./ui/CountUp"), {
  ssr: false,
  loading: () => (
    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-175 mx-auto">
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
  const [searchPinned, setSearchPinned] = useState(false);

  useEffect(() => {
    fetch("/api/static/explore/search-terms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) setSearchTerms(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchPinned) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [searchPinned]);

  return (
    <header className="relative overflow-hidden pt-4 pb-10 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20">
      <div className="absolute inset-0 -z-20">
        <Image
          src={heroBg}
          alt="Vault of Tools hero background"
          fill
          priority
          sizes="100vw"
          quality={75}
          placeholder="blur"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/55 via-white/70 to-white/90" />

      <div className="absolute top-10 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-0 mx-auto max-w-7xl px-4 text-center">
        <h1 className="mt-2 text-2xl font-bold leading-snug tracking-tight sm:text-4xl lg:text-5xl">
          Discover The Best <br className="hidden sm:block" />
          <span className="text-primary">AI Tools</span> For Every Need
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
          Find, compare and review the world best AI tools all in one smart
          directory.
        </p>

        <div className="mx-auto mt-5 max-w-4xl sm:mt-8">
          {searchPinned && (
            <button
              type="button"
              aria-label="Close search"
              className="fixed inset-0 z-[55] bg-black/30 sm:hidden"
              onClick={() => setSearchPinned(false)}
            />
          )}
          <div
            className={
              searchPinned
                ? "fixed top-0 left-0 right-0 z-[60] m-0 bg-white px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 shadow-md sm:static sm:bg-transparent sm:p-0 sm:shadow-none"
                : "relative"
            }
          >
            <SearchBar
              onMobileFocusChange={setSearchPinned}
              pinned={searchPinned}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              Popular:
            </span>

            {searchTerms.map((item) => (
              <Link
                key={item}
                href={`/discover?q=${encodeURIComponent(item)}`}
                className="rounded-full border bg-white/70 px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary sm:text-sm sm:py-2"
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

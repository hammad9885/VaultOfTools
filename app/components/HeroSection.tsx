"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "./ui/SearchBar";
import StatsSection from "./ui/CountUp";
import heroBg from "../assets/images/HeroSection.webp";

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
    <header
      className={`relative pt-4 pb-10 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20 ${
        searchPinned ? "z-[100] overflow-visible" : "overflow-x-hidden"
      }`}
    >
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

      <div className="relative z-0 mx-auto max-w-7xl px-3 text-center sm:px-6">
        <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl lg:leading-snug">
          Discover the Best{" "}
          <br className="hidden sm:block" />
          <span className="text-primary">Tools</span> for Every Need
        </h1>

        <p className="mx-auto mt-2.5 max-w-xl text-xs sm:text-base text-muted-foreground sm:mt-4">
          Find, compare, and discover the best tools for work, business, creativity, productivity, and more.
        </p>

        <div className="mx-auto mt-5 max-w-4xl sm:mt-8">
          {searchPinned && (
            <button
              type="button"
              aria-label="Close search"
              className="fixed inset-0 z-[105] bg-black/30 sm:hidden"
              onClick={() => setSearchPinned(false)}
            />
          )}
          <div
            className={
              searchPinned
                ? "fixed top-0 left-0 right-0 z-[110] m-0 bg-white px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 shadow-md sm:static sm:bg-transparent sm:p-0 sm:shadow-none"
                : "relative"
            }
          >
            <SearchBar
              onMobileFocusChange={setSearchPinned}
              pinned={searchPinned}
            />
          </div>

          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="shrink-0 text-xs sm:text-sm font-medium text-muted-foreground">
              Popular:
            </span>

            {searchTerms.map((item) => (
              <Link
                key={item}
                href={`/discover?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-border/80 bg-white/80 px-2.5 py-1 text-xs transition-colors hover:border-primary hover:text-primary sm:px-3 sm:py-1.5 sm:text-sm shadow-xs"
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

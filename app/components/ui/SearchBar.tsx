"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Suggestion {
  name: string;
  slug: string;
  category: string;
}

interface RawTool {
  name: string;
  slug: string;
  category: string;
}

export function SearchBar({ initialValue = "" }: { initialValue?: string }) {
  const [query, setQuery] = useState(initialValue);
  const [allTools, setAllTools] = useState<Suggestion[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function loadSuggestions(search: string) {
    import("../../lib/api").then(({ api }) => {
      api
        .getTools({ limit: 20, search: search || undefined, sort: "popular" })
        .then((data) => {
          setAllTools(
            data.tools.map((t: RawTool) => ({
              name: t.name,
              slug: t.slug,
              category: t.category,
            }))
          );
          setLoaded(true);
        })
        .catch(() => {
          import("../../routes/index").then((mod) => {
            setAllTools(
              mod.trending.map((t: RawTool) => ({
                name: t.name,
                slug: t.slug,
                category: t.category,
              }))
            );
            setLoaded(true);
          });
        });
    });
  }

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      if (!loaded) return;
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadSuggestions(trimmed);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, loaded]);

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return allTools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(trimmed) ||
          t.category.toLowerCase().includes(trimmed)
      )
      .slice(0, 8);
  }, [query, allTools]);

  useEffect(() => {
    if (suggestions.length > 0 && query.trim().length >= 2) {
      setOpen(true);
    }
  }, [suggestions, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const q = query.trim();
    if (q) {
      router.push(`/discover?q=${encodeURIComponent(q)}`);
    }
  }

  function select(s: Suggestion) {
    setOpen(false);
    setQuery("");
    router.push(`/tool/${s.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      select(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} role="search">
        <Search className="absolute left-3 sm:left-4 top-3.5 sm:top-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground sm:-translate-y-1/2 z-10" />

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder="Search AI tools, categories, or keywords..."
          aria-label="Search AI tools"
          autoComplete="off"
          className="w-full rounded-2xl border border-border bg-white py-3 sm:py-4 pl-10 sm:pl-12 pr-4 sm:pr-32 text-sm sm:text-base shadow-lg outline-none focus:border-primary"
        />

        <button
          type="submit"
          className="mt-3 w-full rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:opacity-90 sm:absolute sm:right-2 sm:top-1/2 sm:mt-0 sm:w-auto sm:-translate-y-1/2"
        >
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 max-h-72 overflow-y-auto rounded-xl border border-border bg-white shadow-xl">
          {suggestions.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onMouseDown={() => select(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                i === activeIdx ? "bg-primary/5 text-primary" : "text-foreground hover:bg-muted"
              }`}
            >
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{s.category}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

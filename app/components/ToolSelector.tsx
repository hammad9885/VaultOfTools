"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { api } from "../lib/api";

export type ToolOption = {
  name: string;
  slug: string;
  category: string;
};

type Props = {
  value: ToolOption | null;
  onChange: (tool: ToolOption) => void;
  disabled?: boolean;
};

export function ToolSelector({ value, onChange, disabled }: Props) {
  const [tools, setTools] = useState<ToolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    // /api/tools caps `limit` at 100, so request the maximum page size.
    api
      .getTools({ limit: 100 })
      .then((data: { tools?: Array<Partial<ToolOption> & { slug?: unknown; name?: unknown }> }) => {
        if (cancelled) return;
        const list = (data.tools || [])
          .filter((t) => Boolean(t?.name && t?.slug))
          .map((t) => ({
            name: String(t.name),
            slug: String(t.slug),
            category: String(t.category || ""),
          }));
        setTools(list);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load the tool list. Try again shortly.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools.slice(0, 60);
    return tools
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      )
      .slice(0, 60);
  }, [tools, query]);

  function select(tool: ToolOption) {
    onChange(tool);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        event.preventDefault();
        select(filtered[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="text-sm font-medium text-foreground">Tool *</span>

      {value ? (
        <div className="mt-1.5 flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {value.category || "Uncategorized"} · /tool/{value.slug}
            </p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ name: "", slug: "", category: "" })}
            className="shrink-0 text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls="tool-selector-listbox"
              autoComplete="off"
              disabled={disabled || loading}
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                loading ? "Loading tools…" : "Search tools (e.g. ChatGPT, Midjourney)…"
              }
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/5 disabled:opacity-60"
            />
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {open && (
            <ul
              id="tool-selector-listbox"
              role="listbox"
              className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg"
            >
              {loading && (
                <li className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading tools…
                </li>
              )}
              {!loading && loadError && (
                <li className="px-3 py-3 text-sm text-red-600">{loadError}</li>
              )}
              {!loading && !loadError && filtered.length === 0 && (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  No tools match “{query.trim()}”.
                </li>
              )}
              {!loading &&
                !loadError &&
                filtered.map((tool, index) => (
                  <li key={tool.slug}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(tool)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                        index === activeIndex ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-foreground">
                          {tool.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {tool.category || "Uncategorized"}
                        </span>
                      </span>
                      {index === activeIndex && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
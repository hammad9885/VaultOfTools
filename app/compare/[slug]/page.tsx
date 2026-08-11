"use client";

// import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "../../lib/api";
import { Check, X } from "lucide-react";
import { SiteNav, SiteFooter } from "../../routes/index";
// import Link from "next/link";

// export const Route = createFileRoute("/compare/$slug")({
//   head: ({ params }) => {
//     const pretty = params.slug.replace(/-vs-/g, " vs ").replace(/-/g, " ");
//     const title = pretty.replace(/\b\w/g, (c: string) => c.toUpperCase());
//     return {
//       meta: [
//         { title: `${title} — Side by side comparison | Vault of Tools` },
//         { name: "description", content: `Compare ${title} on pricing, features, pros and cons.` },
//         { property: "og:title", content: `${title} — Comparison` },
//         { property: "og:description", content: `Compare ${title} side by side.` },
//       ],
//     };
//   },
//   component: ComparePage,
//   errorComponent: ({ reset }) => (
//     <div className="min-h-screen grid place-items-center bg-background">
//       <button onClick={reset} className="text-primary hover:underline">Try again</button>
//     </div>
//   ),
//   notFoundComponent: () => (
//     <div className="min-h-screen grid place-items-center bg-background">
//       <Link href="/" className="text-primary hover:underline">Go home</Link>
//     </div>
//   ),
// });

export default function ComparePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      api.getComparisonDetail(slug).then((res) => {
        setData(res);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [slug]);

  const [aRaw, bRaw] = slug.split("-vs-");
  const slugA = (aRaw ?? "Tool A").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const slugB = (bRaw ?? "Tool B").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const a = data?.a || slugA;
  const b = data?.b || slugB;
  const rows = data?.rows || [];
  const prosA = data?.prosA || [];
  const prosB = data?.prosB || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Comparison</span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight">
            {a} <span className="text-muted-foreground">vs</span> {b}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Side-by-side breakdown of pricing, features, and best use cases.
          </p>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <div className="min-w-[560px]">
          <div className="grid grid-cols-3 border-b border-border bg-surface-soft">
            <div className="p-4 font-semibold text-muted-foreground text-sm">Feature</div>
            <div className="p-4 font-bold text-primary text-center">{a}</div>
            <div className="p-4 font-bold text-foreground text-center">{b}</div>
          </div>
          {rows.map((row: { label: string; a: string; b: string }) => (
            <div key={row.label} className="grid grid-cols-3 border-b border-border last:border-0 text-sm">
              <div className="p-4 text-muted-foreground">{row.label}</div>
              <div className="p-4 text-center font-medium">{row.a}</div>
              <div className="p-4 text-center font-medium">{row.b}</div>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold flex items-center gap-2"><Check className="size-4 text-emerald-600" /> {a} wins at</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {prosA.map((pro: string, i: number) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold flex items-center gap-2"><X className="size-4 text-rose-600" /> {b} wins at</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {prosB.map((pro: string, i: number) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-primary-muted p-5 text-center sm:p-8">
          <h3 className="text-xl font-bold text-foreground">Verdict</h3>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Pick <span className="font-semibold text-primary">{b}</span> for coding-heavy and long-document workflows. Pick <span className="font-semibold text-primary">{a}</span> if you need multimodal output and plugin breadth.
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
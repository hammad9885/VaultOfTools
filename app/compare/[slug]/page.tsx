"use client";

// import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { api } from "../../lib/api";
import { Check, X } from "lucide-react";
import { SiteNav, SiteFooter } from "../../routes/index";
import { ToolLogo } from "../../components/ToolLogo";
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

function display(value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** Build comparison rows from two tools' live compare data. */
function buildRows(aTool: any, bTool: any): { label: string; a: string; b: string }[] {
  const a = aTool?.compare || {};
  const b = bTool?.compare || {};
  const labels: string[] = [];
  const attrs = new Map<string, { label: string }>();

  const add = (label: string) => {
    if (!labels.includes(label)) labels.push(label);
  };
  const addAttr = (attr: { label?: string; value?: string }) => {
    const name = String(attr?.label || "").trim();
    if (name) {
      if (!attrs.has(name)) attrs.set(name, { label: name });
      if (!labels.some((l) => l.toUpperCase() === name.toUpperCase())) labels.push(name);
    }
  };

  add("Overall Rating");
  add("Ease of Use");
  add("Features Score");
  add("Value for Money");
  add("AI Powered");
  add("API Available");
  add("Free Plan");
  add("Free Trial");
  add("Team Collaboration");
  add("Customer Support");
  add("Platforms");
  add("Integrations");
  (a.attributes || []).forEach(addAttr);
  (b.attributes || []).forEach(addAttr);

  const valueOf = (tool: any, compare: any, label: string): string => {
    switch (label) {
      case "Overall Rating": return display(compare.overallRating);
      case "Ease of Use": return display(compare.easeOfUse);
      case "Features Score": return display(compare.featuresScore);
      case "Value for Money": return display(compare.valueForMoney);
      case "AI Powered": return display(compare.aiPowered);
      case "API Available": return display(compare.apiAvailable);
      case "Free Plan": return display(tool?.freePlan);
      case "Free Trial": return display(tool?.freeTrial);
      case "Team Collaboration": return display(compare.teamCollaboration);
      case "Customer Support": return display(compare.customerSupport);
      case "Platforms": return display(compare.platforms);
      case "Integrations": return display(compare.integrations);
      default: {
        const attr = [...(compare.attributes || [])].find(
          (x: any) => String(x?.label || "").trim().toUpperCase() === label.toUpperCase()
        );
        return attr ? display(attr.value) : "—";
      }
    }
  };

  return labels
    .filter((label) => {
      // Only include when at least one side has a real value.
      const va = valueOf(aTool, a, label);
      const vb = valueOf(bTool, b, label);
      return va !== "—" || vb !== "—";
    })
    .map((label) => ({ label, a: valueOf(aTool, a, label), b: valueOf(bTool, b, label) }));
}

export default function ComparePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const [data, setData] = useState<any>(null);
  const [toolA, setToolA] = useState<any>(null);
  const [toolB, setToolB] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [aRaw, bRaw] = slug.split("-vs-");
  const slugA = (aRaw ?? "Tool A").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const slugB = (bRaw ?? "Tool B").replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const slugAKey = (aRaw ?? "").toLowerCase();
  const slugBKey = (bRaw ?? "").toLowerCase();

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.getTool(slugAKey).catch(() => null),
      api.getTool(slugBKey).catch(() => null),
      api.getComparisonDetail(slug).catch(() => null),
    ])
      .then(([ta, tb, detail]) => {
        if (cancelled) return;
        setToolA(ta);
        setToolB(tb);
        setData(detail);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, slugAKey, slugBKey]);

  const a = toolA?.name || data?.a || slugA;
  const b = toolB?.name || data?.b || slugB;
  const rows = useMemo(() => {
    if (toolA || toolB) {
      const live = buildRows(toolA || {}, toolB || {});
      if (live.length > 0) return live;
    }
    return data?.rows || [];
  }, [toolA, toolB, data]);
  const prosA = data?.prosA || toolA?.pros || [];
  const prosB = data?.prosB || toolB?.pros || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const verdict = rows
    .filter((r: any) => r.a !== "—" && r.b !== "—" && r.a !== r.b)
    .map((r: any) => {
      const na = Number(r.a);
      const nb = Number(r.b);
      if (Number.isFinite(na) && Number.isFinite(nb)) {
        return { label: r.label, winner: na > nb ? "a" : na < nb ? "b" : null };
      }
      return { label: r.label, winner: null };
    })
    .filter((v: any) => v.winner)[0];

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1a1a1a] antialiased">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Comparison</span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2">
              <ToolLogo name={String(a)} size={36} className="rounded-lg" />
              {a}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className="inline-flex items-center gap-2">
              <ToolLogo name={String(b)} size={36} className="rounded-lg" />
              {b}
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Side-by-side breakdown of pricing, features, and best use cases.
          </p>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <div className="min-w-[560px]">
          <div className="grid grid-cols-3 border-b border-border bg-surface-soft">
            <div className="p-4 font-semibold text-muted-foreground text-sm">Feature</div>
            <div className="p-4 font-bold text-primary text-center inline-flex items-center justify-center gap-2 w-full">
              <ToolLogo name={String(a)} size={22} />
              {a}
            </div>
            <div className="p-4 font-bold text-foreground text-center inline-flex items-center justify-center gap-2 w-full">
              <ToolLogo name={String(b)} size={22} />
              {b}
            </div>
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
            {verdict
              ? `${verdict.winner === "a" ? a : b} leads on ${verdict.label.toLowerCase()}. Always test both tools against your specific workflow before committing.`
              : `Pick ${a} or ${b} based on your budget and priorities — compare the attributes above against your specific workflow.`}
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
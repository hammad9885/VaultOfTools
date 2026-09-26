import { NextRequest, NextResponse } from "next/server";
import {
  allComparisons,
  type Comparison,
} from "@/app/lib/data/comparisons";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let detail: Comparison | undefined = allComparisons.find(
    (comparison) => comparison.slug === slug
  );
  if (!detail) {
    const reversed = slug.split("-vs-").reverse().join("-vs-");

    const original = allComparisons.find(
      (comparison) => comparison.slug === reversed
    );

    if (original) {
      detail = {
        ...original,
        slug,
        a: original.b,
        b: original.a,
        ratingA: original.ratingB,
        ratingB: original.ratingA,
        pricingA: original.pricingB,
        pricingB: original.pricingA,
        rows: original.rows.map((row) => ({
          ...row,
          a: row.b,
          b: row.a,
        })),
        prosA: original.prosB,
        prosB: original.prosA,
      };
    }
  }
  if (!detail) {
    const parts = slug.split("-vs-");

    if (parts.length === 2) {
      const p0 = parts[0].toLowerCase();
      const p1 = parts[1].toLowerCase();

      for (const original of allComparisons) {
        const k0 = original.a.slug.toLowerCase();
        const k1 = original.b.slug.toLowerCase();

        const directMatch =
          (p0.includes(k0) || k0.includes(p0)) &&
          (p1.includes(k1) || k1.includes(p1));

        const reversedMatch =
          (p0.includes(k1) || k1.includes(p0)) &&
          (p1.includes(k0) || k0.includes(p1));

        if (directMatch) {
          detail = {
            ...original,
            slug,
          };
          break;
        }

        if (reversedMatch) {
          detail = {
            ...original,
            slug,
            a: original.b,
            b: original.a,
            ratingA: original.ratingB,
            ratingB: original.ratingA,
            pricingA: original.pricingB,
            pricingB: original.pricingA,
            rows: original.rows.map((row) => ({
              ...row,
              a: row.b,
              b: row.a,
            })),
            prosA: original.prosB,
            prosB: original.prosA,
          };
          break;
        }
      }
    }
  }
  if (!detail) {
    const parts = slug.split("-vs-");

    const nameA = (parts[0] || "Tool A")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const nameB = (parts[1] || "Tool B")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    detail = {
      slug,
      a: {
        name: nameA,
        slug: parts[0] || "tool-a",
      },
      b: {
        name: nameB,
        slug: parts[1] || "tool-b",
      },
      category: "AI Tools",
      votes: 0,
      ratingA: 4.8,
      ratingB: 4.7,
      pricingA: "Freemium",
      pricingB: "Freemium",
      rows: [
        { label: "Overall Rating", a: "4.8", b: "4.7", type: "higher" },
        { label: "Features Score", a: "9.2 / 10", b: "9.0 / 10", type: "higher" },
        { label: "Ease of Use", a: "4.8", b: "4.6", type: "higher" },
        { label: "Value for Money", a: "4.7", b: "4.8", type: "higher" },
        { label: "Starting Price", a: "Free / Paid", b: "Free / Paid", type: "text" },
        { label: "Free Tier", a: "Yes", b: "Yes", type: "boolean" },
        { label: "API Available", a: "Yes", b: "Yes", type: "boolean" },
        { label: "Team Collaboration", a: "Yes", b: "Yes", type: "boolean" },
        { label: "Customer Support", a: "24/7 Priority", b: "Standard", type: "text" },
      ],
      prosA: [
        "High-performance output and intuitive workflow",
        "Modern UI design with smooth cross-platform experience",
        "Active developer community and frequent updates",
      ],
      prosB: [
        "Comprehensive feature set tailored for power users",
        "Flexible integration capabilities with third-party tools",
        "Extensive documentation and enterprise security",
      ],
      faq: [],
    };
  }

  return NextResponse.json(detail);
}

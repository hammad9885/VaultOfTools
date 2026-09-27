import { NextResponse } from "next/server";
import {
  createComparison,
  type ComparisonAlternative,
} from "@/app/lib/data/comparisons";
import { getMergedSiteTools } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export async function GET() {
  try {
    const tools = await getMergedSiteTools({
      publishedOnly: true,
    });

    const sortedTools = [...tools].sort(
      (a, b) => {
        const featuredDifference =
          Number(Boolean(b.featured)) -
          Number(Boolean(a.featured));

        if (featuredDifference !== 0) {
          return featuredDifference;
        }

        const orderA =
          typeof a.displayOrder === "number"
            ? a.displayOrder
            : Number.MAX_SAFE_INTEGER;

        const orderB =
          typeof b.displayOrder === "number"
            ? b.displayOrder
            : Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return (
          normalizeSearch(a.name).localeCompare(
            normalizeSearch(b.name)
          )
        );
      }
    );

    const popularTools = sortedTools.slice(0, 20);

    const comparisons = [];

    for (
      let index = 0;
      index < popularTools.length;
      index += 1
    ) {
      for (
        let secondIndex = index + 1;
        secondIndex < popularTools.length;
        secondIndex += 1
      ) {
        const first =
          popularTools[index];

        const second =
          popularTools[secondIndex];

        comparisons.push(
          createComparison(
            first,
            second
          )
        );
      }
    }

    const alternatives: ComparisonAlternative[] =
      sortedTools
        .slice(0, 12)
        .map((tool) => ({
          slug: tool.slug,
          name: tool.name,
          category:
            tool.category ||
            tool.subcategory ||
            "AI Tools",
        }));

    const categories = Array.from(
      new Set(
        sortedTools
          .map(
            (tool) =>
              tool.category ||
              tool.subcategory
          )
          .filter(Boolean)
      )
    );

    const filterTabs = [
      {
        label: "All",
        icon: "Search",
      },
      ...categories.map(
        (category) => ({
          label: category,
          icon: "Zap",
        })
      ),
    ];

    return NextResponse.json(
      {
        success: true,
        data: {
          comparisons,
          alternatives,
          filterTabs,
          tools: sortedTools.map(
            (tool) => ({
              slug: tool.slug,
              name: tool.name,
              category:
                tool.category ||
                tool.subcategory ||
                "AI Tools",
              logo:
                tool.logoUrl ||
                tool.logo ||
                tool.imageUrl ||
                null,
              rating:
                typeof tool.rating ===
                "number"
                  ? tool.rating
                  : null,
            })
          ),
        },
        meta: {
          total: comparisons.length,
          publishedTools:
            sortedTools.length,
          generatedAt:
            new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Comparisons listing failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "COMPARISONS_REQUEST_FAILED",
          message:
            "Unable to load comparisons.",
        },
      },
      {
        status: 500,
      }
    );
  }
}
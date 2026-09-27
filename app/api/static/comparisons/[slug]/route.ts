import { NextRequest, NextResponse } from "next/server";
import {
  createComparison,
} from "@/app/lib/data/comparisons";
import { getMergedSiteTools } from "@/app/lib/data/public-tools";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeSlug(value: unknown): string {
  return decodeURIComponent(String(value ?? ""))
    .trim()
    .toLowerCase();
}

function getToolSlugs(slug: string) {
  const normalized = normalizeSlug(slug);
  const separator = "-vs-";
  const separatorIndex = normalized.indexOf(separator);

  if (separatorIndex === -1) {
    return null;
  }

  const first = normalized
    .slice(0, separatorIndex)
    .trim();

  const second = normalized
    .slice(separatorIndex + separator.length)
    .trim();

  if (!first || !second) {
    return null;
  }

  return {
    first,
    second,
  };
}

function toolMatchesSlug(
  tool: {
    slug?: string | null;
  },
  slug: string
) {
  return normalizeSlug(tool.slug) === normalizeSlug(slug);
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await params;

    const requestedSlug = normalizeSlug(slug);

    if (!requestedSlug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SLUG",
            message: "Comparison slug is required.",
          },
        },
        {
          status: 400,
        }
      );
    }

    const requested = getToolSlugs(requestedSlug);

    if (!requested) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_COMPARISON_SLUG",
            message:
              "Use the format tool-a-vs-tool-b.",
          },
        },
        {
          status: 400,
        }
      );
    }

    if (requested.first === requested.second) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SAME_TOOL_COMPARISON",
            message:
              "Please select two different tools.",
          },
        },
        {
          status: 400,
        }
      );
    }

    const tools = await getMergedSiteTools({
      publishedOnly: true,
    });

    if (!Array.isArray(tools)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOOLS_LOAD_FAILED",
            message:
              "Unable to load published tools.",
          },
        },
        {
          status: 500,
        }
      );
    }

    const first = tools.find((tool) =>
      toolMatchesSlug(tool, requested.first)
    );

    const second = tools.find((tool) =>
      toolMatchesSlug(tool, requested.second)
    );

    if (!first || !second) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COMPARISON_NOT_FOUND",
            message:
              "One or both tools are not currently available for comparison.",
          },
          details: {
            requested: {
              first: requested.first,
              second: requested.second,
            },
            firstFound: Boolean(first),
            secondFound: Boolean(second),
            availableTools: tools
              .slice(0, 100)
              .map((tool) => ({
                slug: tool.slug,
                name: tool.name,
                status: tool.status,
              })),
          },
        },
        {
          status: 404,
        }
      );
    }

    if (
      normalizeSlug(first.slug) ===
      normalizeSlug(second.slug)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SAME_TOOL_COMPARISON",
            message:
              "Please select two different tools.",
          },
        },
        {
          status: 400,
        }
      );
    }

    const comparison = createComparison(
      first,
      second
    );

    if (!comparison) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COMPARISON_GENERATION_FAILED",
            message:
              "Unable to generate the comparison.",
          },
        },
        {
          status: 500,
        }
      );
    }

    const canonicalSlug =
      `${normalizeSlug(first.slug)}-vs-${normalizeSlug(second.slug)}`;

    return NextResponse.json(
      {
        success: true,
        data: comparison,
        comparison,
        meta: {
          matchType: "dynamic",
          requestedSlug,
          canonicalSlug,
          available: true,
          generatedAt:
            new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Comparison request failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "COMPARISON_REQUEST_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load the comparison.",
        },
      },
      {
        status: 500,
      }
    );
  }
}
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

const siteOrigin =
  process.env.BASE_URL || "https://vaultoftools.com";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getComparison(slug: string) {
  const baseUrl =
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/static/comparisons/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data?.comparison || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const comparison = await getComparison(slug);

  if (!comparison) {
    return {
      title: "Comparison Not Found | Vault of Tools",
      description:
        "The requested AI tool comparison could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${comparison.a.name} vs ${comparison.b.name} | AI Tool Comparison`;

  const description = `Compare ${comparison.a.name} and ${comparison.b.name} side by side. Explore features, pricing, ratings, strengths, and detailed differences.`;

  const canonicalUrl = `${siteOrigin}/compare/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CompareSlugLayout({
  children,
}: Props) {
  return <>{children}</>;
}
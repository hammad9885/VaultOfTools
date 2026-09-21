import type { Metadata } from "next";
import {
  getComparisonBySlug,
  allComparisons,
} from "@/app/lib/data/comparisons";

const siteOrigin =
  process.env.BASE_URL || "https://vaultoftools.com";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateStaticParams() {
  return allComparisons.map((comparison) => ({
    slug: comparison.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);

  if (!comparison) {
    return {
      title: "Comparison Not Found | Vault of Tools",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${comparison.a.name} vs ${comparison.b.name} — Comparison`;
  const description = `Compare ${comparison.a.name} and ${comparison.b.name} side by side across pricing, features, capabilities, ratings, and use cases.`;

  const canonical = `${siteOrigin}/compare/${comparison.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | Vault of Tools`,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vault of Tools`,
      description,
    },
  };
}

export default function CompareSlugLayout({
  children,
}: Props) {
  return <>{children}</>;
}

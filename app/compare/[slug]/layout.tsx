import type { Metadata } from "next";
import { comparisonDetails, allComparisons } from "@/app/lib/data/comparisons";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comp =
    comparisonDetails[slug] ||
    allComparisons.find((c) => c.slug === slug);

  const title = comp
    ? `${comp.a} vs ${comp.b} — Side-by-Side Comparison (2026)`
    : `${slug.replace(/-/g, " ")} — AI Tool Comparison`;

  const description = comp
    ? `Comprehensive head-to-head comparison of ${comp.a} and ${comp.b}. Compare pricing, benchmarks, capabilities, context length, and features.`
    : `Compare features, pricing, and pros/cons side-by-side on Vault of Tools.`;

  const canonicalUrl = `${siteOrigin}/compare/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Vault of Tools`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vault of Tools`,
      description,
    },
  };
}

export default function CompareSlugLayout({ children }: Props) {
  return <>{children}</>;
}

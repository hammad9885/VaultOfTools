import type { Metadata } from "next";
import { categories } from "@/app/lib/data/categories";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

function titleFromSlug(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const match = categories.find(
    (c) =>
      c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug ||
      c.name.toLowerCase() === slug.toLowerCase()
  );

  const categoryName = match?.name || titleFromSlug(slug);
  const canonicalUrl = `${siteOrigin}/category/${slug}`;

  return {
    title: `Best ${categoryName} Tools (2026)`,
    description: `Discover and compare top ${categoryName} software, tools, and platforms on Vault of Tools.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Best ${categoryName} Tools | Vault of Tools`,
      description: `Curated list of top ${categoryName} tools.`,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default function CategorySlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

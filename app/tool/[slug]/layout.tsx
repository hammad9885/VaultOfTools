import type { Metadata } from "next";
import { homepageFeaturedTools } from "@/app/lib/data/homepage-tools";
import { categoryToolMap } from "@/app/lib/data/categories";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

function findTool(slug: string) {
  const featured = homepageFeaturedTools.find((t) => t.slug === slug);
  if (featured) return featured;

  for (const list of Object.values(categoryToolMap)) {
    const found = list.find(
      (t) =>
        t.slug === slug ||
        t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
    );
    if (found) return found;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = findTool(slug);

  const name = tool?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const description =
    tool?.desc ||
    `Read in-depth reviews, pricing details, pros and cons, and top alternatives for ${name} on Vault of Tools.`;

  const canonicalUrl = `${siteOrigin}/tool/${slug}`;

  return {
    title: `${name} — Reviews, Pricing & Features (2026)`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${name} — AI Tool Review & Pricing | Vault of Tools`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Vault of Tools`,
      description,
    },
  };
}

export default async function ToolSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = findTool(slug);
  const name = tool?.name || slug.replace(/-/g, " ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name,
        applicationCategory: tool?.category || "Artificial Intelligence",
        operatingSystem: "Web-based",
        description: tool?.desc || `AI software tool for ${tool?.category || "modern workflows"}.`,
        offers: {
          "@type": "Offer",
          price: tool?.pricing === "Free" ? "0" : undefined,
          priceCurrency: "USD",
        },
        aggregateRating: tool?.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: tool.rating,
              reviewCount: Math.max(1, tool.reviews || 1),
            }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteOrigin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: tool?.category || "Tools",
            item: `${siteOrigin}/discover`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name,
            item: `${siteOrigin}/tool/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

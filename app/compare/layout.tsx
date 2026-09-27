import type { Metadata } from "next";

const siteOrigin =
  process.env.BASE_URL || "https://vaultoftools.com";

export const metadata: Metadata = {
  title: "Compare AI Tools Head-to-Head | Vault of Tools",
  description:
    "Compare AI tools side by side by features, pricing, ratings, strengths, and capabilities.",
  alternates: {
    canonical: `${siteOrigin}/compare`,
  },
  openGraph: {
    title: "Compare AI Tools Head-to-Head",
    description:
      "Compare AI tools side by side by features, pricing, ratings, strengths, and capabilities.",
    url: `${siteOrigin}/compare`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare AI Tools Head-to-Head",
    description:
      "Compare AI tools side by side by features, pricing, ratings, strengths, and capabilities.",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
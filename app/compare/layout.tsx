import type { Metadata } from "next";

const siteOrigin =
  process.env.BASE_URL || "https://vaultoftools.com";

export const metadata: Metadata = {
  title: "Compare AI Tools Head-to-Head",
  description:
    "Compare leading AI tools side by side across features, pricing, capabilities, ratings, and use cases.",
  alternates: {
    canonical: `${siteOrigin}/compare`,
  },
  openGraph: {
    title: "Compare AI Tools Head-to-Head | Vault of Tools",
    description:
      "Detailed side-by-side AI tool comparisons covering pricing, features, capabilities, and use cases.",
    url: `${siteOrigin}/compare`,
    type: "website",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

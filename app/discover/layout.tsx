import type { Metadata } from "next";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

export const metadata: Metadata = {
  title: "Discover AI Tools — Filter by Free, Freemium & Categories",
  description:
    "Explore, filter, and discover over 2,500+ top artificial intelligence tools. Filter by price, rating, popularity, and categories.",
  alternates: {
    canonical: `${siteOrigin}/discover`,
  },
  openGraph: {
    title: "Discover AI Tools | Vault of Tools",
    description: "Search and filter over 2,500+ AI tools across all categories.",
    url: `${siteOrigin}/discover`,
    type: "website",
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

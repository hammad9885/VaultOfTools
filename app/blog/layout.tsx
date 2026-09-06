import type { Metadata } from "next";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

export const metadata: Metadata = {
  title: "AI Guides, Benchmarks & Industry Insights",
  description:
    "In-depth articles, benchmark analyses, and guides to discovering and adopting the best AI tools.",
  alternates: {
    canonical: `${siteOrigin}/blog`,
  },
  openGraph: {
    title: "AI Guides & Benchmarks | Vault of Tools Blog",
    description: "In-depth evaluations and tutorials on modern AI software.",
    url: `${siteOrigin}/blog`,
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

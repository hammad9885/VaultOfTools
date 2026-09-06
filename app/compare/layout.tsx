import type { Metadata } from "next";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

export const metadata: Metadata = {
  title: "Compare AI Tools Head-to-Head",
  description:
    "Compare leading AI models and software side-by-side. Benchmark Claude 3.5 Sonnet vs ChatGPT-4o, Cursor vs Copilot, and more.",
  alternates: {
    canonical: `${siteOrigin}/compare`,
  },
  openGraph: {
    title: "Compare AI Tools Head-to-Head | Vault of Tools",
    description: "Detailed side-by-side technical benchmarks and feature comparisons.",
    url: `${siteOrigin}/compare`,
    type: "website",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

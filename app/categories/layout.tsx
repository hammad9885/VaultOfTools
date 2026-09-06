import type { Metadata } from "next";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

export const metadata: Metadata = {
  title: "All AI Tool Categories",
  description:
    "Browse hundreds of curated AI tools grouped by category: AI Writing, Coding, Design, Marketing, Automation, Audio, and Video.",
  alternates: {
    canonical: `${siteOrigin}/categories`,
  },
  openGraph: {
    title: "All AI Tool Categories | Vault of Tools",
    description: "Browse curated AI tools grouped by workflow and category.",
    url: `${siteOrigin}/categories`,
    type: "website",
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import { OFFICIAL_EMAIL } from "./lib/constants";

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";
const BRAND_LOGO = `${siteOrigin}/logos/vaultoftools.svg`;

const SOCIAL_PROFILES = [
  process.env.SOCIAL_TWITTER_URL,
  process.env.SOCIAL_FACEBOOK_URL,
  process.env.SOCIAL_INSTAGRAM_URL,
  process.env.SOCIAL_LINKEDIN_URL,
  process.env.SOCIAL_GITHUB_URL,
  process.env.SOCIAL_YOUTUBE_URL,
].filter((url): url is string => Boolean(url && /^https:\/\//.test(url)));

const PRIMARY_SECTIONS = [
  { name: "Discover AI Tools", url: `${siteOrigin}/discover` },
  { name: "Categories", url: `${siteOrigin}/categories` },
  { name: "Compare AI", url: `${siteOrigin}/compare` },
  { name: "Tool Reviews", url: `${siteOrigin}/toolsreview` },
  { name: "Submit Tool", url: `${siteOrigin}/submit` },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Vault of Tools — Discover the Best AI Tools",
    template: "%s | Vault of Tools",
  },
  description:
    "Vault of Tools is the curated directory of 2,500+ AI tools. Discover, compare, and review the best AI for any workflow.",
  keywords: ["AI tools", "AI directory", "best AI tools", "compare AI", "Vault of Tools"],
  authors: [{ name: "Vault of Tools", url: siteOrigin }],
  alternates: {
    canonical: siteOrigin,
  },
  openGraph: {
    title: "Vault of Tools — Discover the Best AI Tools",
    description: "Curated directory of 2,500+ AI tools. Discover, compare, and review the best AI tools.",
    url: siteOrigin,
    siteName: "Vault of Tools",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vault of Tools",
    description: "Discover the best AI tools for your workflow.",
    site: "@VaultOfTools",
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteOrigin}/#organization`,
      name: "Vault of Tools",
      legalName: "Vault of Tools",
      alternateName: ["VaultOfTools", "VOT"],
      slogan: "Discover the best AI tools",
      url: siteOrigin,
      description:
        "Vault of Tools is a curated directory of AI tools to discover, compare, and review.",
      email: OFFICIAL_EMAIL,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteOrigin}/#logo`,
        url: BRAND_LOGO,
        contentUrl: BRAND_LOGO,
        width: "512",
        height: "512",
        caption: "Vault of Tools",
      },
      image: { "@id": `${siteOrigin}/#logo` },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: OFFICIAL_EMAIL,
          url: `${siteOrigin}/contact`,
          areaServed: "Worldwide",
          availableLanguage: ["English"],
        },
        {
          "@type": "ContactPoint",
          contactType: "tool submissions",
          email: OFFICIAL_EMAIL,
          url: `${siteOrigin}/submit`,
          areaServed: "Worldwide",
          availableLanguage: ["English"],
        },
      ],
      ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
      knowsAbout: [
        "Artificial Intelligence",
        "AI Tools",
        "Generative AI",
        "Large Language Models",
        "AI Tool Directory",
        "AI Tool Reviews",
        "AI Tool Comparisons",
        "Machine Learning",
        "Developer Tools",
        "Productivity Software",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteOrigin}/#website`,
      url: siteOrigin,
      name: "Vault of Tools",
      alternateName: ["VaultOfTools", "VOT"],
      description: "Curated directory of AI tools to discover, compare, and review.",
      inLanguage: "en-US",
      publisher: { "@id": `${siteOrigin}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteOrigin}/discover?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${siteOrigin}/#webpage`,
      url: siteOrigin,
      name: "Vault of Tools — Discover the Best AI Tools",
      isPartOf: { "@id": `${siteOrigin}/#website` },
      about: { "@id": `${siteOrigin}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteOrigin}/#navigation`,
      name: "Main Navigation",
      url: siteOrigin,
      isPartOf: { "@id": `${siteOrigin}/#website` },
      potentialAction: PRIMARY_SECTIONS.map((section) => ({
        "@type": "SiteNavigationElement",
        name: section.name,
        url: section.url,
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${siteOrigin}/#sitelinks`,
      name: "Vault of Tools — Main Sections",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: PRIMARY_SECTIONS.length,
      itemListElement: PRIMARY_SECTIONS.map((section, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: section.name,
        url: section.url,
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

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

const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";

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
      "@type": "WebSite",
      "@id": `${siteOrigin}/#website`,
      url: siteOrigin,
      name: "Vault of Tools",
      description: "Curated directory of 2,500+ AI tools to discover, compare, and review.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteOrigin}/discover?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteOrigin}/#organization`,
      name: "Vault of Tools",
      url: siteOrigin,
      logo: `${siteOrigin}/logos/chatgpt.svg`,
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

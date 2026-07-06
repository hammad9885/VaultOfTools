import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google'
import "./globals.css";
import Navbar from "./components/ui/Navbar";
import Footer from "./components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // metadataBase: new URL("https://artificialpod.com"),
  title: {
    default: "Vault of Tools — Discover the Best AI Tools",
    template: "%s | Vault of Tools",
  },
  description:
    "Vault of Tools is the curated directory of 2,500+ AI tools. Discover, compare, and review the best AI for any workflow.",
  keywords: ["AI tools", "AI directory", "best AI tools", "compare AI", "Vault of Tools"],
  authors: [{ name: "Vault of Tools" }],
  openGraph: {
    title: "Vault of Tools — Discover the Best AI Tools",
    description: "Curated directory of 2,500+ AI tools.",
    // url: "",
    siteName: "Vault of Tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vault of Tools",
    description: "Discover the best AI tools.",
    site: "@VaultOfTools",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // <html lang="en" className={`${inter.variable} h-full antialiased`}>
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
        <Footer /> 
        </body>
    </html>
  );
}

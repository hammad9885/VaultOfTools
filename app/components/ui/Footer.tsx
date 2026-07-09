"use client";

import Link from "next/link";
import { FaXTwitter, FaLinkedinIn, FaGithub, FaDiscord } from "react-icons/fa6";
import { HiMiniBolt } from "react-icons/hi2";

function Footer() {
  const explore = [
    { label: "Discover", href: "/discover" },
    { label: "Categories", href: "/categories" },
    { label: "Compare", href: "/compare" },
    { label: "Tools reviews", href: "/toolsreview" }
  ];

  const resources = [
    { label: "Blog", href: "/blog" },
    { label: "Newsletter", href: "/newsletter" },
    { label: "AI Guides", href: "/guides" },
    { label: "API Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
    { label: "Support", href: "/support" },
  ];

  const company = [
    { label: "About", href: "/about" },
    { label: "Submit Tool", href: "/submit" },
    { label: "Advertise", href: "/advertise" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ];

  const legal = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  const socials = [
    {
      icon: <FaXTwitter />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <FaLinkedinIn />,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: <FaGithub />,
      href: "https://github.com",
      label: "GitHub",
    },
    {
      icon: <FaDiscord />,
      href: "https://discord.com",
      label: "Discord",
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-border bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-12 pb-14 border-b border-border">
          <div className="xl:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 no-underline group"
            >
              <div className="w-11 h-11 rounded-2xl bg-primary shadow-lg shadow-primary/20 grid place-items-center">
                <HiMiniBolt className="text-primary-foreground text-xl" />
              </div>
              <span
                className="font-bold text-[18px] text-foreground transition-colors duration-150 group-hover:text-primary"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Vault<span className="text-primary">of</span>Tools
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              VaultOfTools is a curated AI tools directory helping developers,
              founders, creators, and businesses discover powerful tools,
              automate workflows, and stay ahead in the AI ecosystem.
            </p>
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />

                <button className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                  Subscribe
                </button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Weekly AI tools, trends & product launches.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-7">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-primary flex items-center justify-center transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="text-lg">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4
              className="text-sm font-bold tracking-wide text-foreground mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Explore
            </h4>

            <ul className="space-y-3">
              {explore.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4
              className="text-sm font-bold tracking-wide text-foreground mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Resources
            </h4>

            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4
              className="text-sm font-bold tracking-wide text-foreground mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Company
            </h4>

            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-7 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="text-sm text-muted-foreground text-center lg:text-left">
            &copy; 2026{" "}
            <span className="font-semibold text-primary">VaultOfTools</span>
            . All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

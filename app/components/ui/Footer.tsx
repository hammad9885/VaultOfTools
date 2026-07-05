"use client";

import Link from "next/link";

import {
  FaXTwitter,
  FaLinkedinIn,
  FaGithub,
  FaDiscord,
} from "react-icons/fa6";

import { HiMiniBolt } from "react-icons/hi2";

function Footer() {
  const explore = [
    { label: "All Tools", href: "/tools" },
    { label: "Trending AI Tools", href: "/trending" },
    { label: "New Launches", href: "/new" },
    { label: "Top Rated", href: "/top-rated" },
    { label: "Free AI Tools", href: "/free-tools" },
    { label: "Categories", href: "/categories" },
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
    <footer className="relative mt-24 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-12 pb-14 border-b border-slate-200 dark:border-slate-800">
          <div className="xl:col-span-2">
            <Link href="/" className="flex items-center gap-2 shrink-0 no-underline group [&:hover_.logo-icon]:rotate-15 [&:hover_.logo-icon]:scale-[1.08]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HiMiniBolt className="text-white text-xl" />
              </div>
          <span className="font-bold text-[18px] text-slate-800 dark:text-slate-100 transition-colors duration-150 group-hover:text-sky-500" style={{ fontFamily: "'Syne', sans-serif" }}>
            Vault<span className="text-sky-500">of</span>Tools
          </span>
        </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-400">
              VaultOfTools is a curated AI tools directory helping developers,
              founders, creators, and businesses discover powerful tools,
              automate workflows, and stay ahead in the AI ecosystem.
            </p>
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />

                <button className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20">
                  Subscribe
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-400">
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
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-500 flex items-center justify-center transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="text-lg">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4
              className="text-sm font-bold tracking-wide text-slate-900 dark:text-white mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Explore
            </h4>

            <ul className="space-y-3">
              {explore.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4
              className="text-sm font-bold tracking-wide text-slate-900 dark:text-white mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Resources
            </h4>

            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4
              className="text-sm font-bold tracking-wide text-slate-900 dark:text-white mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Company
            </h4>

            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-7 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center lg:text-left">
            © 2026{" "}
            <span className="font-semibold text-emerald-500">
              VaultOfTools
            </span>
            . All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors no-underline"
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
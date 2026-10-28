"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FaXTwitter,
  FaYoutube,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa6";
import { HiMiniBolt } from "react-icons/hi2";
import { api } from "../../lib/api";
import { OFFICIAL_SOCIAL_LINKS } from "../../lib/constants";

function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.subscribeNewsletter(trimmedEmail);

      toast.success(
        response.message ||
          `Subscribed successfully — ${trimmedEmail} is now on the list.`
      );

      setEmail("");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to subscribe right now.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Explore",
      links: [
        {
          label: "Discover",
          href: "/discover",
        },
        {
          label: "Categories",
          href: "/categories",
        },
        {
          label: "Compare",
          href: "/compare",
        },
        {
          label: "Tools Reviews",
          href: "/toolsreview",
        },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          label: "Blog",
          href: "/blog",
        },
        {
          label: "Newsletter",
          href: "/newsletter",
        },
        {
          label: "AI Guides",
          href: "/guides",
        },
        {
          label: "API Docs",
          href: "/docs",
        },
        {
          label: "Changelog",
          href: "/changelog",
        },
        {
          label: "Support",
          href: "/support",
        },
      ],
    },
    {
      title: "Company",
      links: [
        {
          label: "About",
          href: "/about",
        },
        {
          label: "Submit Tool",
          href: "/submit",
        },
        {
          label: "Advertise",
          href: "/advertise",
        },
        {
          label: "Contact",
          href: "/contact",
        },
      ],
    },
  ];

  const legal = [
    {
      label: "Privacy Policy",
      href: "/privacy",
    },
    {
      label: "Terms of Service",
      href: "/terms",
    },
    {
      label: "Cookie Policy",
      href: "/cookies",
    },
  ];

  const socials = [
    {
      icon: <FaXTwitter />,
      href: OFFICIAL_SOCIAL_LINKS.twitter,
      label: "X",
    },
    {
      icon: <FaYoutube />,
      href: OFFICIAL_SOCIAL_LINKS.youtube,
      label: "YouTube",
    },
    {
      icon: <FaFacebookF />,
      href: OFFICIAL_SOCIAL_LINKS.facebook,
      label: "Facebook",
    },
    {
      icon: <FaInstagram />,
      href: OFFICIAL_SOCIAL_LINKS.instagram,
      label: "Instagram",
    },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#020617]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/[0.06] blur-3xl dark:bg-indigo-500/[0.08]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="grid gap-12 border-b border-slate-200 pb-12 dark:border-slate-800 lg:grid-cols-[1.35fr_2fr_1.25fr] lg:gap-16 lg:pb-14">
          <div className="max-w-md">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="VaultOfTools Home"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                <HiMiniBolt className="text-xl text-white" />
              </span>

              <span
                className="text-xl font-black tracking-tight text-slate-950 transition-colors duration-200 group-hover:text-[#4F46E5] dark:text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Vault
                <span className="text-[#4F46E5]">of</span>
                Tools
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
              VaultOfTools is a curated platform for discovering, comparing, and exploring useful tools.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-500">
              <span>2.5k+ tools</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>120+ categories</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Weekly briefs</span>
            </div>

            <div className="mt-7 flex items-center gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F46E5] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300 dark:focus:ring-indigo-500/10"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                  {column.title}
                </h3>

                <ul className="mt-5 space-y-3.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group inline-flex items-center text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-[#4F46E5] dark:text-slate-400 dark:hover:text-indigo-300"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              Premium newsletter
            </div>

            <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Stay ahead of AI
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Get the latest AI tools, trends, launches, and useful resources
              delivered to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="mt-5">
              <label
                htmlFor="footer-newsletter-email"
                className="sr-only"
              >
                Email address
              </label>

              <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-label="Email address"
                  disabled={isSubmitting}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/10"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 shrink-0 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] px-5 text-sm font-semibold text-white shadow-md shadow-indigo-500/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-indigo-500/20"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
            </form>

            <p className="mt-3 text-[11px] leading-5 text-slate-400 dark:text-slate-500">
              Weekly AI briefs. No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-2 text-center text-xs text-slate-500 sm:order-1 sm:text-left dark:text-slate-500">
            &copy; 2026{" "}
            <span className="font-semibold text-[#4F46E5]">
              VaultOfTools
            </span>
            . All rights reserved.
          </p>

          <div className="order-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:order-2">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-[#4F46E5] dark:text-slate-500 dark:hover:text-indigo-300"
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


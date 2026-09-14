"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FaXTwitter, FaLinkedinIn, FaGithub, FaDiscord } from "react-icons/fa6";
import { HiMiniBolt } from "react-icons/hi2";
import { api } from "../../lib/api";

function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
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
      toast.success(response.message || `Subscribed successfully — ${trimmedEmail} is now on the list.`);
      setEmail("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to subscribe right now.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Explore",
      badge: "Discover",
      accent: "border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-violet-50",
      linkClass: "text-slate-600 hover:text-indigo-600",
      links: [
        { label: "Discover", href: "/discover", description: "Explore trending AI tools" },
        { label: "Categories", href: "/categories", description: "Browse by use case" },
        { label: "Compare", href: "/compare", description: "See tools side by side" },
        { label: "Tools reviews", href: "/toolsreview", description: "Hands-on expert insights" },
      ],
    },
    {
      title: "Resources",
      badge: "Learn",
      accent: "border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50",
      linkClass: "text-slate-600 hover:text-violet-600",
      links: [
        { label: "Blog", href: "/blog", description: "Read the latest updates" },
        { label: "Newsletter", href: "/newsletter", description: "Weekly AI briefs" },
        { label: "AI Guides", href: "/guides", description: "Get practical tutorials" },
        { label: "API Docs", href: "/docs", description: "Developer documentation" },
        { label: "Changelog", href: "/changelog", description: "See product changes" },
        { label: "Support", href: "/support", description: "Helpful answers" },
      ],
    },
    {
      title: "Company",
      badge: "Grow",
      accent: "border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-cyan-50",
      linkClass: "text-slate-600 hover:text-sky-600",
      links: [
        { label: "About", href: "/about", description: "Our mission and story" },
        { label: "Submit Tool", href: "/submit", description: "Add a new AI tool" },
        { label: "Advertise", href: "/advertise", description: "Promote with us" },
        { label: "Contact", href: "/contact", description: "Talk to the team" },
      ],
    },
  ];

  const legal = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  const socials = [
    { icon: <FaXTwitter />, href: "https://twitter.com", label: "Twitter" },
    { icon: <FaLinkedinIn />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <FaGithub />, href: "https://github.com", label: "GitHub" },
    { icon: <FaDiscord />, href: "https://discord.com", label: "Discord" },
  ];

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] sm:mt-24 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto max-w-7xl px-3 pb-8 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <div className="rounded-[30px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_32px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-950/60">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 dark:border-slate-800 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <Link href="/" className="flex items-center gap-3 no-underline group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] shadow-lg shadow-indigo-500/20">
                  <HiMiniBolt className="text-xl text-white" />
                </div>
                <span
                  className="text-[20px] font-black text-slate-900 transition-colors duration-200 group-hover:text-[#4F46E5] dark:text-white"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Vault<span className="text-[#4F46E5]">of</span>Tools
                </span>
              </Link>

              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                VaultOfTools is a curated AI tools directory helping developers, founders,
                creators, and businesses discover powerful tools, automate workflows, and stay
                ahead in the AI ecosystem.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: "2.5k+ tools", tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200" },
                  { label: "120+ categories", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200" },
                  { label: "Weekly briefs", tone: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200" },
                ].map((item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${item.tone}`}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full max-w-lg">
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
                Premium newsletter
              </div>

              <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 shrink-0 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Weekly AI tools, trends, and product launches — no spam, unsubscribe anytime.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {columns.map((column, index) => (
              <div
                key={column.title}
                className={`rounded-[24px] border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${column.accent}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h4
                    className="text-sm font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {column.title}
                  </h4>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {column.badge}
                  </span>
                </div>

                <ul className="mt-4 space-y-3">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={`block rounded-2xl border border-transparent bg-white/60 p-3 text-left transition-all duration-200 hover:border-slate-200 hover:bg-white dark:bg-slate-900/60 dark:hover:border-slate-700 ${column.linkClass}`}
                      >
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {item.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-5 lg:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-base text-slate-500 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:text-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400 lg:text-left">
            &copy; 2026 <span className="font-semibold text-[#4F46E5]">VaultOfTools</span>. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-slate-500 transition-colors hover:text-[#4F46E5] dark:text-slate-400 dark:hover:text-indigo-300"
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

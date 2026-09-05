import Link from "next/link";
import { FaXTwitter, FaLinkedinIn, FaGithub, FaDiscord } from "react-icons/fa6";
import { HiMiniBolt } from "react-icons/hi2";

function Footer() {
  const explore = [
    { label: "Discover", href: "/discover" },
    { label: "Categories", href: "/categories" },
    { label: "Compare", href: "/compare" },
    { label: "Tools reviews", href: "/toolsreview" },
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
    <footer className="relative mt-12 sm:mt-24 overflow-hidden border-t border-border bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-3 pb-8 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 border-b border-gray-200 pb-10 sm:pb-12 dark:border-slate-800 md:grid-cols-4 xl:grid-cols-5 xl:gap-12 xl:pb-14">
          <div className="col-span-2 md:col-span-4 xl:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 no-underline group"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#6366F1] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
                <HiMiniBolt className="text-white text-xl" />
              </div>
              <span
                className="font-bold text-[18px] text-gray-900 dark:text-slate-100 transition-colors duration-150 group-hover:text-[#6366F1]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Vault<span className="text-[#6366F1]">of</span>Tools
              </span>
            </Link>

            <p className="mt-4 sm:mt-5 max-w-md text-xs sm:text-sm leading-6 sm:leading-7 text-gray-500 dark:text-slate-400">
              VaultOfTools is a curated AI tools directory helping developers,
              founders, creators, and businesses discover powerful tools,
              automate workflows, and stay ahead in the AI ecosystem.
            </p>
            <div className="mt-5 sm:mt-6">
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:flex-1 h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
                />

                <button className="h-10 sm:h-11 px-5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold transition-all w-full sm:w-auto">
                  Subscribe
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-400 dark:text-slate-500">
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
                  className="w-10 h-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-[#6366F1] flex items-center justify-center transition-all duration-200 hover:-translate-y-1"
                >
                  <span className="text-lg">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <h4
              className="text-sm font-bold tracking-wide text-gray-900 dark:text-white mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Explore
            </h4>

            <ul className="space-y-3">
              {explore.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-[#6366F1] transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <h4
              className="text-sm font-bold tracking-wide text-gray-900 dark:text-white mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Resources
            </h4>

            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-[#6366F1] transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <h4
              className="text-sm font-bold tracking-wide text-gray-900 dark:text-white mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Company
            </h4>

            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 dark:text-slate-400 hover:text-[#6366F1] transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-5 pt-7 lg:flex-row">
          <div className="text-sm text-gray-400 dark:text-slate-500 text-center lg:text-left">
            &copy; 2026{" "}
            <span className="font-semibold text-[#6366F1]">VaultOfTools</span>.
            All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-gray-400 dark:text-slate-500 hover:text-[#6366F1] transition-colors no-underline"
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

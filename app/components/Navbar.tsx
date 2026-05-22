"use client";

import { useEffect, useRef, useState } from "react";
import Tools from "./icons/Tools";
import ClaudeAi from "./icons/ClaudeAi";
import Runway from "./icons/Runway";
import Perplexity from "./icons/Perplexity";
import Cursor from "./icons/Cursor";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../assets/css/Navbar.css";
import { useTheme } from "../hooks/useTheme";

const btnPress =
  "transition-[transform,box-shadow] duration-120 ease-in-out hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(14,165,233,0.18)] active:translate-y-0 active:scale-[0.97] active:shadow-none";

const btnPrimary =
  "transition-[transform,box-shadow] duration-120 ease-in-out hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(14,165,233,0.35)] active:scale-[0.96] active:shadow-none";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex items-center w-13 h-7 rounded-full border cursor-pointer shrink-0 theme-toggle-track bg-sky-100 border-sky-200 dark:bg-slate-700 dark:border-slate-600"
    >
      <span className={`absolute left-1.5 text-[13px] transition-opacity duration-200 ${isDark ? "opacity-30" : "opacity-100"}`} aria-hidden="true">☀️</span>
      <span className={`absolute right-1.5 text-[12px] transition-opacity duration-200 ${isDark ? "opacity-100" : "opacity-30"}`} aria-hidden="true">🌙</span>
      <span className="theme-toggle-thumb absolute top-0.5 w-6 h-6 rounded-full shadow-md bg-white translate-x-0.5 dark:bg-slate-900 dark:translate-x-6.5" />
    </button>
  );
}

function Navbar() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { isDark } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY < 60) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        setVisible(false);
        setMobileOpen(false);
      } else if (currentY < lastScrollY.current - 8) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Discover", link: "", active: true },
    { label: "Categories", link: "" },
    { label: "Compare", link: "" },
    { label: "Alternatives", link: "" },
    { label: "Blog", link: "", badge: "New" },
  ];

  const scrolledShadow = scrolled
    ? "shadow-[0_2px_20px_rgba(0,0,0,0.4),0_1px_4px_rgba(0,0,0,0.3)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
    : "";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-100 transition-[transform,opacity] duration-350 ease-in-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-[-110%] opacity-0 pointer-events-none"
      }`}
    >
      <nav className={`flex items-center justify-between gap-4 h-17 px-6 md:px-8 backdrop-blur-xl border-b transition-shadow duration-300 bg-white/95 border-sky-100 dark:bg-slate-900/95 dark:border-slate-700/60 ${scrolledShadow}`}>
        <Link href="/" className="flex items-center gap-2 shrink-0 no-underline group [&:hover_.logo-icon]:rotate-15 [&:hover_.logo-icon]:scale-[1.08]">
          <div className="logo-icon w-8 h-8 rounded-xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-200 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <i className="ti ti-shield-bolt text-white text-base" />
          </div>
          <span className="font-bold text-[18px] text-slate-800 dark:text-slate-100 transition-colors duration-150 group-hover:text-sky-500" style={{ fontFamily: "'Syne', sans-serif" }}>
            Vault<span className="text-sky-500">of</span>Tools
          </span>
        </Link>
        <ul className="hidden lg:flex items-center gap-1 list-none">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.link}
                className={`nav-link-item flex items-center gap-1.5 text-[13.5px] px-3 py-1.5 rounded-lg no-underline transition-all duration-150 ${
                  link.active
                    ? "active-link font-semibold text-sky-700 bg-sky-50 dark:text-sky-400 dark:bg-slate-800"
                    : "text-slate-500 hover:text-sky-700 hover:bg-sky-50 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 border rounded-md animate-pulse bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-900/50 dark:text-sky-400 dark:border-sky-700">
                    {link.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 max-w-130 justify-end">
          <div className="hidden sm:flex items-center gap-2.5 border rounded-xl px-3.5 h-10.5 min-w-65 max-w-85 w-full transition-[border-color,box-shadow,background] duration-200 bg-sky-50/70 border-sky-100 hover:border-sky-200 hover:bg-white focus-within:border-sky-300 focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.15)] focus-within:bg-white dark:bg-slate-800/70 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:focus-within:border-sky-500 dark:focus-within:bg-slate-800">
            <i className="ti ti-search text-sky-400 text-[15px] shrink-0" />
            <input
              type="text"
              placeholder="Search 3,200+ tools..."
              aria-label="Search tools"
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-slate-700 placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <span className="hidden md:flex text-[11px] px-1.5 py-1 border rounded-md shrink-0 shadow-sm text-slate-400 bg-white border-sky-100 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700">
              ⌘K
            </span>
          </div>
          <button className={`sm:hidden w-10 h-10 flex items-center justify-center rounded-xl border text-sky-500 cursor-pointer border-sky-100 bg-sky-50 dark:border-slate-600 dark:bg-slate-800 ${btnPress}`}>
            <i className="ti ti-search text-base" />
          </button>
          <ThemeToggle />
          <button
            onClick={() => router.push("/signin")}
            className={`hidden md:flex items-center gap-1.5 text-[13px] px-3.5 py-1.75 rounded-lg border whitespace-nowrap cursor-pointer shadow-sm text-sky-600 hover:text-sky-700 border-sky-200 bg-white hover:bg-sky-50 dark:text-sky-400 dark:hover:text-sky-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 ${btnPress}`}
          >
            <i className="ti ti-user text-sm" />
            Sign in
          </button>
          <button className={`flex items-center gap-1.5 text-[13px] font-semibold text-white bg-linear-to-r from-sky-500 to-blue-500 px-4 py-1.75 h-10.5 rounded-xl shrink-0 cursor-pointer whitespace-nowrap shadow-md shadow-sky-200 ${btnPrimary}`}>
            <i className="ti ti-plus text-sm" />
            <span className="hidden sm:inline">Submit Tool</span>
            <span className="sm:hidden">Submit</span>
          </button>
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className={`lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg border cursor-pointer gap-1.25 border-sky-100 bg-sky-50 dark:border-slate-600 dark:bg-slate-800 ${btnPress} ${mobileOpen ? "ham-open" : ""}`}
            aria-label="Toggle menu"
          >
            <span className="bar1 block w-4.5 h-0.5 rounded-full transition-[transform,opacity,width] duration-300 ease-in-out origin-center bg-sky-600 dark:bg-slate-300" />
            <span className="bar2 block w-4.5 h-0.5 rounded-full transition-[transform,opacity,width] duration-300 ease-in-out origin-center bg-sky-600 dark:bg-slate-300" />
            <span className="bar3 block w-4.5 h-0.5 rounded-full transition-[transform,opacity,width] duration-300 ease-in-out origin-center bg-sky-600 dark:bg-slate-300" />
          </button>
        </div>
      </nav>
      <div className={`lg:hidden border-b shadow-lg overflow-hidden transition-[max-height,opacity] duration-350 ease-in-out bg-white border-sky-100 dark:bg-slate-900 dark:border-slate-700/60 ${mobileOpen ? "max-h-100 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 py-3 flex flex-col gap-1">
          <div className="flex sm:hidden items-center gap-2.5 border rounded-xl px-3.5 h-10.5 w-full mb-2 bg-sky-50/70 border-sky-100 dark:bg-slate-800/70 dark:border-slate-700">
            <i className="ti ti-search text-sky-400 text-[15px] shrink-0" />
            <input type="text" placeholder="Search 3,200+ tools..." className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-slate-700 placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500" />
          </div>
          {links.map((link) => (
            <a key={link.label} href="#"
              className={`flex items-center justify-between text-[14px] px-3 py-2.5 rounded-lg no-underline transition-[background,color,padding-left] duration-150 hover:pl-5 ${
                link.active
                  ? "text-sky-700 font-semibold bg-sky-50 dark:text-sky-400 dark:bg-slate-800"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-400"
              }`}
            >
              <span className="flex items-center gap-2">
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 border rounded-md bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-900/50 dark:text-sky-400 dark:border-sky-700">
                    {link.badge}
                  </span>
                )}
              </span>
              {link.active && <i className="ti ti-chevron-right text-sky-400 text-sm" />}
            </a>
          ))}

          <div className="flex gap-2 mt-2 pt-2 border-t border-sky-100 dark:border-slate-700">
            <div className="flex-1 flex items-center justify-between px-3 rounded-lg border border-sky-100 bg-sky-50 dark:border-slate-600 dark:bg-slate-800">
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                {isDark ? "Dark mode" : "Light mode"}
              </span>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex gap-2 mt-1">
            <button className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] py-2.5 rounded-lg border cursor-pointer text-sky-600 hover:text-sky-700 border-sky-200 bg-white hover:bg-sky-50 dark:text-sky-400 dark:hover:text-sky-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 ${btnPress}`}>
              <i className="ti ti-user text-sm" />
              Sign in
            </button>
            <button className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white bg-linear-to-r from-sky-500 to-blue-500 py-2.5 rounded-xl cursor-pointer shadow-md shadow-sky-200 ${btnPrimary}`}>
              <i className="ti ti-plus text-sm" />
              Submit Tool
            </button>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="overflow-hidden border-b py-2 bg-sky-50 border-sky-100 dark:bg-slate-800/80 dark:border-slate-700/60">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-8">
              <span className="flex items-center gap-1.5 text-sky-500 text-[11px] font-semibold whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse inline-block" />
                Live updates
              </span>
              <span className="flex items-center gap-1 text-[12px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                <Runway size={16} />
                <strong className="font-medium text-slate-700 dark:text-slate-200">Sora 2</strong>
                <span>added — Text to Video</span>
              </span>
              <span className="text-sm text-sky-200 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[12px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                <Perplexity size={16} />
                <strong className="font-medium text-slate-700 dark:text-slate-200">Perplexity Pro</strong>
                <span>pricing updated</span>
              </span>
              <span className="text-sm text-sky-200 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[12px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                <Cursor size={16} />
                <strong className="font-medium text-slate-700 dark:text-slate-200">Cursor AI</strong>
                <span>top rated this week</span>
              </span>
              <span className="text-sm text-sky-200 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[12px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                <Tools size={16} />
                <span>142 tools added this month</span>
              </span>
              <span className="text-sm text-sky-200 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[12px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                <ClaudeAi size={16} />
                <strong className="font-medium text-slate-700 dark:text-slate-200">Claude 4</strong>
                <span>now listed</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
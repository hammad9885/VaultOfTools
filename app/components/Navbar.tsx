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
      className={`
        relative flex items-center w-13 h-7 rounded-full border cursor-pointer shrink-0
        theme-toggle-track
        ${
          isDark
            ? "bg-slate-700 border-slate-600"
            : "bg-sky-100 border-sky-200"
        }
      `}
    >
      <span
        className={`absolute left-1.5 text-[13px] transition-opacity duration-200 ${
          isDark ? "opacity-30" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        ☀️
      </span>
      <span
        className={`absolute right-1.5 text-[12px] transition-opacity duration-200 ${
          isDark ? "opacity-100" : "opacity-30"
        }`}
        aria-hidden="true"
      >
        🌙
      </span>
      <span
        className={`
          theme-toggle-thumb absolute top-0.5 w-6 h-6 rounded-full shadow-md
          ${isDark ? "translate-x-6.5 bg-slate-900" : "translate-x-0.5 bg-white"}
        `}
      />
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

  const handleSignInClick = () => {
    router.push("/signin");
  };

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

  const navBg = isDark
    ? "bg-slate-900/95 border-slate-700/60"
    : "bg-white/95 border-sky-100";

  const searchBg = isDark
    ? "bg-slate-800/70 border-slate-700 hover:border-slate-500 hover:bg-slate-800 focus-within:border-sky-500 focus-within:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] focus-within:bg-slate-800"
    : "bg-sky-50/70 border-sky-100 hover:border-sky-200 hover:bg-white focus-within:border-sky-300 focus-within:shadow-[0_0_0_3px_rgba(56,189,248,0.15)] focus-within:bg-white";

  const searchInput = isDark
    ? "text-slate-200 placeholder:text-slate-500"
    : "text-slate-700 placeholder:text-slate-400";

  const kbdBadge = isDark
    ? "text-slate-500 bg-slate-800 border-slate-700"
    : "text-slate-400 bg-white border-sky-100";

  const signInBtn = isDark
    ? "text-sky-400 hover:text-sky-300 border-slate-600 bg-slate-800 hover:bg-slate-700"
    : "text-sky-600 hover:text-sky-700 border-sky-200 bg-white hover:bg-sky-50";

  const hamburgerBg = isDark
    ? "border-slate-600 bg-slate-800"
    : "border-sky-100 bg-sky-50";

  const hamburgerBar = isDark ? "bg-slate-300" : "bg-sky-600";

  const mobileBg = isDark
    ? "bg-slate-900 border-slate-700/60"
    : "bg-white border-sky-100";

  const mobileLinkBase = isDark
    ? "text-slate-400 hover:bg-slate-800 hover:text-sky-400"
    : "text-slate-600 hover:bg-sky-50 hover:text-sky-800";

  const mobileLinkActive = isDark
    ? "text-sky-400 font-semibold bg-slate-800"
    : "text-sky-700 font-semibold bg-sky-50";

  const tickerBg = isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-sky-50 border-sky-100";
  const tickerText = isDark ? "text-slate-400" : "text-slate-500";
  const tickerStrong = isDark ? "text-slate-200" : "text-slate-700";

  const scrolledShadow = isDark
    ? "shadow-[0_2px_20px_rgba(0,0,0,0.4),0_1px_4px_rgba(0,0,0,0.3)]"
    : "shadow-[0_2px_20px_rgba(14,165,233,0.08),0_1px_4px_rgba(0,0,0,0.06)]";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-100 transition-[transform,opacity] duration-350 ease-in-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-[-110%] opacity-0 pointer-events-none"
      }`}
    >
      <nav
        className={`flex items-center justify-between gap-4 h-17 px-6 md:px-8 backdrop-blur-xl border-b transition-shadow duration-300 ${navBg} ${
          scrolled ? scrolledShadow : ""
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 no-underline group [&:hover_.logo-icon]:rotate-15 [&:hover_.logo-icon]:scale-[1.08]"
        >
          <div className="logo-icon w-8 h-8 rounded-xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-200 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <i className="ti ti-shield-bolt text-white text-base" aria-hidden="true" />
          </div>
          <span
            className={`font-bold text-[18px] transition-colors duration-150 group-hover:text-sky-500 ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
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
                    ? `active-link font-semibold ${
                        isDark
                          ? "text-sky-400 bg-slate-800"
                          : "text-sky-700 bg-sky-50"
                      }`
                    : isDark
                    ? "text-slate-400 hover:text-sky-400 hover:bg-slate-800"
                    : "text-slate-500 hover:text-sky-700 hover:bg-sky-50"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 border rounded-md animate-pulse ${
                      isDark
                        ? "bg-sky-900/50 text-sky-400 border-sky-700"
                        : "bg-sky-100 text-sky-600 border-sky-200"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 max-w-130 justify-end">
          <div
            className={`hidden sm:flex items-center gap-2.5 border rounded-xl px-3.5 h-10.5 min-w-65 max-w-85 w-full transition-[border-color,box-shadow,background] duration-200 ${searchBg}`}
          >
            <i className="ti ti-search text-sky-400 text-[15px] shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search 3,200+ tools..."
              aria-label="Search tools"
              className={`flex-1 bg-transparent border-none outline-none text-[13.5px] ${searchInput}`}
            />
            <span
              className={`hidden md:flex text-[11px] px-1.5 py-1 border rounded-md shrink-0 shadow-sm ${kbdBadge}`}
            >
              ⌘K
            </span>
          </div>
          <button
            className={`sm:hidden w-10 h-10 flex items-center justify-center rounded-xl border text-sky-500 cursor-pointer ${hamburgerBg} ${btnPress}`}
          >
            <i className="ti ti-search text-base" aria-hidden="true" />
          </button>
          <ThemeToggle />
          <button
            onClick={handleSignInClick}
            className={`hidden md:flex items-center gap-1.5 text-[13px] px-3.5 py-1.75 rounded-lg border whitespace-nowrap cursor-pointer shadow-sm ${signInBtn} ${btnPress}`}
          >
            <i className="ti ti-user text-sm" aria-hidden="true" />
            Sign in
          </button>
          <button
            className={`flex items-center gap-1.5 text-[13px] font-semibold text-white bg-linear-to-r from-sky-500 to-blue-500 px-4 py-1.75 h-10.5 rounded-xl shrink-0 cursor-pointer whitespace-nowrap shadow-md shadow-sky-200 ${btnPrimary}`}
          >
            <i className="ti ti-plus text-sm" aria-hidden="true" />
            <span className="hidden sm:inline">Submit Tool</span>
            <span className="sm:hidden">Submit</span>
          </button>
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className={`lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg border cursor-pointer gap-1.25 ${hamburgerBg} ${btnPress} ${
              mobileOpen ? "ham-open" : ""
            }`}
            aria-label="Toggle menu"
          >
            <span className={`bar1 block w-4.5 h-0.5 rounded-full transition-[transform,opacity,width] duration-300 ease-in-out origin-center ${hamburgerBar}`} />
            <span className={`bar2 block w-4.5 h-0.5 rounded-full transition-[transform,opacity,width] duration-300 ease-in-out origin-center ${hamburgerBar}`} />
            <span className={`bar3 block w-4.5 h-0.5 rounded-full transition-[transform,opacity,width] duration-300 ease-in-out origin-center ${hamburgerBar}`} />
          </button>
        </div>
      </nav>
      <div
        className={`lg:hidden border-b shadow-lg overflow-hidden transition-[max-height,opacity] duration-350 ease-in-out ${mobileBg} ${
          isDark ? "shadow-black/30" : "shadow-sky-100/40"
        } ${mobileOpen ? "max-h-100 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          <div
            className={`flex sm:hidden items-center gap-2.5 border rounded-xl px-3.5 h-10.5 w-full mb-2 transition-[border-color,box-shadow,background] duration-200 ${searchBg}`}
          >
            <i className="ti ti-search text-sky-400 text-[15px] shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search 3,200+ tools..."
              className={`flex-1 bg-transparent border-none outline-none text-[13.5px] ${searchInput}`}
            />
          </div>
          {links.map((link) => (
            <a
              key={link.label}
              href="#"
              className={`flex items-center justify-between text-[14px] px-3 py-2.5 rounded-lg no-underline transition-[background,color,padding-left] duration-150 hover:pl-5 ${
                link.active ? mobileLinkActive : mobileLinkBase
              }`}
            >
              <span className="flex items-center gap-2">
                {link.label}
                {link.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 border rounded-md ${
                      isDark
                        ? "bg-sky-900/50 text-sky-400 border-sky-700"
                        : "bg-sky-100 text-sky-600 border-sky-200"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </span>
              {link.active && (
                <i className="ti ti-chevron-right text-sky-400 text-sm" aria-hidden="true" />
              )}
            </a>
          ))}
          <div
            className={`flex gap-2 mt-2 pt-2 border-t ${
              isDark ? "border-slate-700" : "border-sky-100"
            }`}
          >
            <div
              className={`flex-1 flex items-center justify-between px-3 rounded-lg border ${
                isDark
                  ? "border-slate-600 bg-slate-800"
                  : "border-sky-100 bg-sky-50"
              }`}
            >
              <span
                className={`text-[12px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isDark ? "Dark mode" : "Light mode"}
              </span>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex gap-2 mt-1">
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] py-2.5 rounded-lg border cursor-pointer ${signInBtn} ${btnPress}`}
            >
              <i className="ti ti-user text-sm" aria-hidden="true" />
              Sign in
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white bg-linear-to-r from-sky-500 to-blue-500 py-2.5 rounded-xl cursor-pointer shadow-md shadow-sky-200 ${btnPrimary}`}
            >
              <i className="ti ti-plus text-sm" aria-hidden="true" />
              Submit Tool
            </button>
          </div>
        </div>
      </div>
      <div className={`overflow-hidden border-b py-2 ${tickerBg}`}>
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-8">
              <span className="flex items-center gap-1.5 text-sky-500 text-[11px] font-semibold whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse inline-block" />
                Live updates
              </span>
              <span className={`flex items-center gap-1 text-[12px] whitespace-nowrap ${tickerText}`}>
                <Runway size={16} />
                <strong className={`font-medium ${tickerStrong}`}>Sora 2</strong>
                <span>added — Text to Video</span>
              </span>
              <span className={`text-sm ${isDark ? "text-slate-600" : "text-sky-200"}`}>·</span>
              <span className={`flex items-center gap-1 text-[12px] whitespace-nowrap ${tickerText}`}>
                <Perplexity size={16} />
                <strong className={`font-medium ${tickerStrong}`}>Perplexity Pro</strong>
                <span>pricing updated</span>
              </span>
              <span className={`text-sm ${isDark ? "text-slate-600" : "text-sky-200"}`}>·</span>
              <span className={`flex items-center gap-1 text-[12px] whitespace-nowrap ${tickerText}`}>
                <Cursor size={16} />
                <strong className={`font-medium ${tickerStrong}`}>Cursor AI</strong>
                <span>top rated this week</span>
              </span>
              <span className={`text-sm ${isDark ? "text-slate-600" : "text-sky-200"}`}>·</span>
              <span className={`flex items-center gap-1 text-[12px] whitespace-nowrap ${tickerText}`}>
                <Tools size={16} />
                <span>142 tools added this month</span>
              </span>
              <span className={`text-sm ${isDark ? "text-slate-600" : "text-sky-200"}`}>·</span>
              <span className={`flex items-center gap-1 text-[12px] whitespace-nowrap ${tickerText}`}>
                <ClaudeAi size={16} />
                <strong className={`font-medium ${tickerStrong}`}>Claude 4</strong>
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
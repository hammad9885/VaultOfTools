"use client";

import { useEffect, useRef, useState } from "react";
import Tools from "./icons/Tools";
import ClaudeAi from "./icons/ClaudeAi";
import Runway from "./icons/Runway";
import Perplexity from "./icons/Perplexity";
import Cursor from "./icons/Cursor";

function Navbar() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

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
    { label: "Discover", active: true },
    { label: "Categories" },
    { label: "Compare" },
    { label: "Alternatives" },
    { label: "Blog", badge: "New" },
  ];

  return (
    <>
      <style>{`
        .navbar-wrap {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .navbar-wrap.hidden-nav {
          transform: translateY(-110%);
          opacity: 0;
          pointer-events: none;
        }
        .navbar-wrap.visible-nav {
          transform: translateY(0);
          opacity: 1;
        }

        /* Nav links underline animation */
        .nav-link-item {
          position: relative;
        }
        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 50%; right: 50%;
          height: 2px;
          background: #0ea5e9;
          border-radius: 2px;
          transition: left 0.25s cubic-bezier(0.4,0,0.2,1),
                      right 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .nav-link-item:hover::after,
        .nav-link-item.active-link::after {
          left: 8px; right: 8px;
        }

        /* Button press effect */
        .btn-press {
          transition: transform 0.12s cubic-bezier(0.4,0,0.2,1),
                      box-shadow 0.12s ease,
                      background 0.15s ease,
                      opacity 0.15s ease;
        }
        .btn-press:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.18);
        }
        .btn-press:active {
          transform: translateY(0px) scale(0.97);
          box-shadow: none;
        }

        .btn-primary-sky {
          transition: transform 0.12s cubic-bezier(0.4,0,0.2,1),
                      box-shadow 0.15s ease,
                      background 0.15s ease;
        }
        .btn-primary-sky:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(14, 165, 233, 0.35);
        }
        .btn-primary-sky:active {
          transform: scale(0.96);
          box-shadow: none;
        }

        /* Search focus glow */
        .search-wrap {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .search-wrap:focus-within {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
          background: #fff;
        }

        /* Logo icon spin on hover */
        .logo-icon {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .logo-wrap:hover .logo-icon {
          transform: rotate(15deg) scale(1.08);
        }

        /* Mobile menu slide */
        .mobile-menu {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.3s ease;
        }
        .mobile-menu.closed {
          max-height: 0;
          opacity: 0;
        }
        .mobile-menu.open {
          max-height: 400px;
          opacity: 1;
        }

        /* Mobile link hover */
        .mobile-link {
          transition: background 0.15s, color 0.15s, padding-left 0.2s;
        }
        .mobile-link:hover {
          padding-left: 20px;
          background: #f0f9ff;
          color: #0369a1;
        }

        /* Hamburger bars */
        .ham-bar {
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.2s ease,
                      width 0.2s ease;
          transform-origin: center;
        }
        .ham-open .bar1 { transform: translateY(6px) rotate(45deg); }
        .ham-open .bar2 { opacity: 0; transform: scaleX(0); }
        .ham-open .bar3 { transform: translateY(-6px) rotate(-45deg); }

        /* Live strip scroll animation */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }

        /* Scrolled shadow */
        .nav-scrolled {
          box-shadow: 0 2px 20px rgba(14, 165, 233, 0.08), 0 1px 4px rgba(0,0,0,0.06);
        }
      `}</style>

      <div className={`navbar-wrap ${visible ? "visible-nav" : "hidden-nav"}`}>
        <nav
          className={`flex items-center justify-between gap-4 h-17 px-6 md:px-8 bg-white/95 backdrop-blur-xl border-b border-sky-100 transition-shadow duration-300 ${scrolled ? "nav-scrolled" : ""}`}
        >
          <a
            href="#"
            className="logo-wrap flex items-center gap-2 shrink-0 no-underline group"
          >
            <div className="logo-icon w-8 h-8 rounded-xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-200">
              <i
                className="ti ti-shield-bolt text-white text-base"
                aria-hidden="true"
              />
            </div>
            <span
              className="font-bold text-[18px] text-slate-800 transition-colors duration-150 group-hover:text-sky-700"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Vault<span className="text-sky-500">of</span>Tools
            </span>
          </a>
          <ul className="hidden lg:flex items-center gap-1 list-none">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href="#"
                  className={`nav-link-item flex items-center gap-1.5 text-[13.5px] px-3 py-1.5 rounded-lg no-underline transition-all duration-150 ${
                    link.active
                      ? "active-link text-sky-700 font-semibold bg-sky-50"
                      : "text-slate-500 hover:text-sky-700 hover:bg-sky-50"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-100 text-sky-600 border border-sky-200 rounded-md animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 max-w-130 justify-end">
            <div className="search-wrap hidden sm:flex items-center gap-2.5 bg-sky-50/70 border border-sky-100 rounded-xl px-3.5 h-10.5 min-w-65 max-w-85 w-full hover:border-sky-200 hover:bg-white">
              <i
                className="ti ti-search text-sky-400 text-[15px] shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search 3,200+ tools..."
                aria-label="Search tools"
                className="flex-1 bg-transparent border-none outline-none text-slate-700 text-[13.5px] placeholder:text-slate-400"
              />
              <span className="hidden md:flex text-[11px] text-slate-400 px-1.5 py-1 bg-white border border-sky-100 rounded-md shrink-0 shadow-sm">
                ⌘K
              </span>
            </div>
            <button className="sm:hidden btn-press w-10 h-10 flex items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-500 cursor-pointer">
              <i className="ti ti-search text-base" aria-hidden="true" />
            </button>
            <button className="btn-press hidden md:flex items-center gap-1.5 text-[13px] text-sky-600 hover:text-sky-700 px-3.5 py-1.75 rounded-lg border border-sky-200 bg-white hover:bg-sky-50 whitespace-nowrap cursor-pointer shadow-sm">
              <i className="ti ti-user text-sm" aria-hidden="true" />
              Sign in
            </button>
            <button className="btn-primary-sky flex items-center gap-1.5 text-[13px] font-semibold text-white bg-linear-to-r from-sky-500 to-blue-500 px-4 py-1.75 h-10.5 rounded-xl shrink-0 cursor-pointer whitespace-nowrap shadow-md shadow-sky-200">
              <i className="ti ti-plus text-sm" aria-hidden="true" />
              <span className="hidden sm:inline">Submit Tool</span>
              <span className="sm:hidden">Submit</span>
            </button>
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className={`lg:hidden btn-press flex flex-col justify-center items-center w-9 h-9 rounded-lg border border-sky-100 bg-sky-50 cursor-pointer gap-1.25 ${mobileOpen ? "ham-open" : ""}`}
              aria-label="Toggle menu"
            >
              <span className="ham-bar bar1 block w-4.5 h-0.5 bg-sky-600 rounded-full" />
              <span className="ham-bar bar2 block w-4.5 h-0.5 bg-sky-600 rounded-full" />
              <span className="ham-bar bar3 block w-4.5 h-0.5 bg-sky-600 rounded-full" />
            </button>
          </div>
        </nav>
        <div
          className={`mobile-menu lg:hidden bg-white border-b border-sky-100 shadow-lg shadow-sky-100/40 ${mobileOpen ? "open" : "closed"}`}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            <div className="search-wrap flex sm:hidden items-center gap-2.5 bg-sky-50 border border-sky-100 rounded-xl px-3.5 h-10.5 w-full mb-2">
              <i
                className="ti ti-search text-sky-400 text-[15px] shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search 3,200+ tools..."
                className="flex-1 bg-transparent border-none outline-none text-slate-700 text-[13.5px] placeholder:text-slate-400"
              />
            </div>
            {links.map((link) => (
              <a
                key={link.label}
                href="#"
                className={`mobile-link flex items-center justify-between text-[14px] px-3 py-2.5 rounded-lg no-underline ${
                  link.active
                    ? "text-sky-700 font-semibold bg-sky-50"
                    : "text-slate-600"
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-100 text-sky-600 border border-sky-200 rounded-md">
                      {link.badge}
                    </span>
                  )}
                </span>
                {link.active && (
                  <i
                    className="ti ti-chevron-right text-sky-400 text-sm"
                    aria-hidden="true"
                  />
                )}
              </a>
            ))}
            <div className="flex gap-2 mt-2 pt-2 border-t border-sky-100">
              <button className="btn-press flex-1 flex items-center justify-center gap-1.5 text-[13px] text-sky-600 py-2.5 rounded-lg border border-sky-200 bg-white cursor-pointer">
                <i className="ti ti-user text-sm" aria-hidden="true" />
                Sign in
              </button>
              <button className="btn-primary-sky flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white bg-linear-to-r from-sky-500 to-blue-500 py-2.5 rounded-xl cursor-pointer shadow-md shadow-sky-200">
                <i className="ti ti-plus text-sm" aria-hidden="true" />
                Submit Tool
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-hidden bg-sky-50 border-b border-sky-100 py-2">
          <div className="marquee-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-8">
                <span className="flex items-center gap-1.5 text-sky-600 text-[11px] font-semibold whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse inline-block" />
                  Live updates
                </span>
                <span className="flex items-center gap-1 text-[12px] text-slate-500 whitespace-nowrap">
                  <Runway size={16} className="" />
                  <strong className="text-slate-700 font-medium">Sora 2</strong>
                  <span>added — Text to Video</span>
                </span>

                <span className="text-sky-200 text-sm">·</span>

                <span className="flex items-center gap-1 text-[12px] text-slate-500 whitespace-nowrap">
                  <Perplexity size={16} className="" />
                  <strong className="text-slate-700 font-medium">
                    Perplexity Pro
                  </strong>
                  <span>pricing updated</span>
                </span>

                <span className="text-sky-200 text-sm">·</span>

                <span className="flex items-center gap-1 text-[12px] text-slate-500 whitespace-nowrap">
                  <Cursor size={16} className="" />
                  <strong className="text-slate-700 font-medium">
                    Cursor AI
                  </strong>
                  <span>top rated this week</span>
                </span>

                <span className="text-sky-200 text-sm">·</span>

                <span className="flex items-center gap-1 text-[12px] text-slate-500 whitespace-nowrap">
                  <Tools size={16} />
                  <span>142 tools added this month</span>
                </span>

                <span className="text-sky-200 text-sm">·</span>

                <span className="flex items-center gap-1 text-[12px] text-slate-500 whitespace-nowrap">
                  <ClaudeAi size={16} />
                  <strong className="text-slate-700 font-medium">
                    Claude 4
                  </strong>
                  <span>now listed</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;

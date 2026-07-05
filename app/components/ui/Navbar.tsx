"use client";

import { useState } from "react";
import Tools from "../icons/Tools";
import ClaudeAi from "../icons/ClaudeAi";
import Runway from "../icons/Runway";
import Perplexity from "../icons/Perplexity";
import Cursor from "../icons/Cursor";
import Link from "next/link";
import "../../assets/css/Navbar.css";
import UserMenu from "../UserMenu";
import LoginModal from "../LoginModal";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ChevronDown } from "lucide-react";




function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const categories = ["AI Writing", "AI Image", "AI Video", "AI Coding", "AI Marketing", "Chatbots", "Productivity", "Analytics"];





  return (
    <div
      className="fixed top-0 left-0 right-0 z-100 transition-[transform,opacity] duration-350 ease-in-out"
    >
         <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AP</span>
              </div>
              <span className="font-bold text-gray-900 text-lg hidden sm:block">ArtificialPod</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setCatOpen(!catOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-violet-600 font-medium text-sm transition-colors"
                >
                  Categories <ChevronDown size={14} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-8 left-0 bg-white border border-gray-100 rounded-xl shadow-lg p-4 w-64 grid grid-cols-2 gap-2 z-50"
                    >
                      {categories.map((c) => (
                        <a key={c} href="#" className="text-sm text-gray-600 hover:text-violet-600 hover:bg-violet-50 px-3 py-2 rounded-lg transition-colors">
                          {c}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {["Compare", "Alternatives", "Blog", "Submit a Tool"].map((item) => (
                <a key={item} href="#" className="text-gray-600 hover:text-violet-600 font-medium text-sm transition-colors">
                  {item}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex p-2 text-gray-500 hover:text-violet-600 transition-colors">
                <Search size={18} />
              </button>
              <UserMenu onOpenLogin={() => setLoginOpen(true)} />
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-500">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {["Categories", "Compare", "Alternatives", "Blog", "Submit a Tool"].map((item) => (
                  <a key={item} href="#" className="text-gray-700 hover:text-violet-600 font-medium py-2 border-b border-gray-50 last:border-0">
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => { setLoginOpen(true); setMenuOpen(false); }}
                  className="w-full bg-violet-600 text-white font-medium py-2.5 rounded-xl mt-1"
                >
                  Sign In / Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

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
                <strong className="font-medium text-slate-700 dark:text-slate-200">
                  Sora 2
                </strong>
                <span>added — Text to Video</span>
              </span>
              <span className="text-sm text-sky-200 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[12px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                <Perplexity size={16} />
                <strong className="font-medium text-slate-700 dark:text-slate-200">
                  Perplexity Pro
                </strong>
                <span>pricing updated</span>
              </span>
              <span className="text-sm text-sky-200 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[12px] whitespace-nowrap text-slate-500 dark:text-slate-400">
                <Cursor size={16} />
                <strong className="font-medium text-slate-700 dark:text-slate-200">
                  Cursor AI
                </strong>
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
                <strong className="font-medium text-slate-700 dark:text-slate-200">
                  Claude 4
                </strong>
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


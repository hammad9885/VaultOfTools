
import {
  FaPenNib,
  FaImage,
  FaCode,
  FaVideo,
  FaChartBar,
  FaMicrophone,
  FaUsers,
  FaGavel,
  FaHeartbeat,
  FaSchool,
  FaBullhorn,
  FaRobot,
} from "react-icons/fa";
import ClaudeAi from "../components/icons/ClaudeAi";
import Midjourney from "../components/icons/Midjourney";
import Cursor from "../components/icons/Cursor";
import Perplexity from "../components/icons/Perplexity";
import type { Category, Tool, TrendingItem, QuickFilter, Stat } from "../types/types";


export const categories: Category[] = [
  {
    icon: FaPenNib,
    name: "Writing",
    count: "312 tools",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: FaImage,
    name: "Image Gen",
    count: "248 tools",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: FaCode,
    name: "Coding",
    count: "195 tools",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: FaVideo,
    name: "Video AI",
    count: "167 tools",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: FaChartBar,
    name: "Analytics",
    count: "143 tools",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: FaMicrophone,
    name: "Voice & Audio",
    count: "121 tools",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: FaUsers,
    name: "Sales & CRM",
    count: "98 tools",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: FaGavel,
    name: "Legal AI",
    count: "74 tools",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: FaHeartbeat,
    name: "Healthcare",
    count: "63 tools",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: FaSchool,
    name: "Education",
    count: "118 tools",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: FaBullhorn,
    name: "Marketing",
    count: "204 tools",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: FaRobot,
    name: "Agents & Auto",
    count: "89 tools",
    color: "bg-purple-50 text-purple-600",
  },
];

export const featuredTools: Tool[] = [
  {
    icon: ClaudeAi,
    iconBg: "bg-emerald-100",
    iconColor: "",
    name: "Claude",
    tagline: "AI assistant by Anthropic",
    desc: "Next-generation AI for complex reasoning, analysis, coding, and nuanced conversation.",
    tags: ["Chat", "Coding"],
    pricing: "Freemium",
    pricingClass: "bg-blue-50 text-blue-600 border border-blue-200",
    rating: 4.9,
    reviews: "2.1k",
    updated: "Updated today",
    sponsored: true,
    iconSize: 22,
    stars: 5,
  },
  {
    icon: Midjourney,
    iconBg: "bg-blue-100",
    iconColor: "",
    name: "Midjourney",
    tagline: "AI image generation",
    desc: "Create stunning artwork from text prompts. Industry-leading quality for designers and creators.",
    tags: ["Images", "Design"],
    pricing: "Paid",
    pricingClass: "bg-purple-50 text-purple-600 border border-purple-200",
    rating: 4.7,
    reviews: "8.3k",
    iconSize: 36,
    updated: "Updated 2d ago",
    sponsored: false,
    stars: 4,
  },
  {
    icon: Cursor,
    iconBg: "bg-violet-100",
    iconColor: "",
    name: "Cursor AI",
    tagline: "AI-first code editor",
    desc: "The VS Code fork that understands your entire codebase. Ship 10x faster with AI pair programming.",
    tags: ["Coding", "IDE"],
    pricing: "Freemium",
    pricingClass: "bg-blue-50 text-blue-600 border border-blue-200",
    rating: 4.8,
    reviews: "5.7k",
    updated: "Updated today",
    sponsored: false,
    iconSize: 22,
    stars: 5,
  },
  {
    icon: Perplexity,
    iconBg: "bg-amber-100",
    iconColor: "",
    name: "Perplexity AI",
    tagline: "AI-powered search engine",
    desc: "Real-time AI search with citations. Research faster than ever with source-backed answers.",
    tags: ["Search", "Research"],
    pricing: "Free",
    pricingClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    rating: 4.6,
    reviews: "4.2k",
    iconSize: 22,
    updated: "Pricing updated",
    sponsored: false,
    stars: 4,
  },
];

export const trending: TrendingItem[] = [
  { rank: 1, icon: "ti-message-chatbot", name: "Claude",       change: "↑ 24%",  bg: "bg-emerald-100 text-emerald-600", up: true  },
  { rank: 2, icon: "ti-brand-vscode",    name: "Cursor AI",    change: "↑ 18%",  bg: "bg-blue-100 text-blue-600",      up: true  },
  { rank: 3, icon: "ti-video",           name: "Sora 2",       change: "↑ 311%", bg: "bg-amber-100 text-amber-600",    up: true  },
  { rank: 4, icon: "ti-writing",         name: "Notion AI",    change: "↑ 9%",   bg: "bg-violet-100 text-violet-600",  up: true  },
  { rank: 5, icon: "ti-microphone",      name: "ElevenLabs",   change: "↑ 15%",  bg: "bg-rose-100 text-rose-600",      up: true  },
  { rank: 6, icon: "ti-chart-bar",       name: "Julius AI",    change: "↑ 7%",   bg: "bg-sky-100 text-sky-600",        up: true  },
  { rank: 7, icon: "ti-photo-ai",        name: "Adobe Firefly",change: "↓ 3%",   bg: "bg-teal-100 text-teal-600",      up: false },
  { rank: 8, icon: "ti-users",           name: "HubSpot AI",   change: "↑ 12%",  bg: "bg-yellow-100 text-yellow-600",  up: true  },
];

export const quickFilters: QuickFilter[] = [
  { icon: "ti-writing",   label: "Writing"   },
  { icon: "ti-photo-ai",  label: "Image Gen" },
  { icon: "ti-code",      label: "Coding"    },
  { icon: "ti-video",     label: "Video"     },
  { icon: "ti-microphone",label: "Voice AI"  },
  { icon: "ti-chart-bar", label: "Data"      },
  { icon: "ti-users",     label: "Sales"     },
  { icon: "ti-gavel",     label: "Legal"     },
];

export const heroStats: Stat[] = [
  { num: "3,247", lbl: "AI Tools"   },
  { num: "89",    lbl: "Categories" },
  { num: "Daily", lbl: "Updates"   },
  { num: "Free",  lbl: "Forever"   },
];
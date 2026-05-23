import type { NavItem } from "../types/navigation";

import {
  HiOutlineSquares2X2,
  HiOutlineScale,
  HiOutlineArrowTrendingUp,
  HiOutlineSparkles,
  HiOutlineFolder,
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineBuildingOffice2,
  HiOutlineCodeBracket,
  HiOutlineVideoCamera,
  HiOutlinePhoto,
  HiOutlineMicrophone,
  HiOutlineDocumentText,
  HiOutlineRocketLaunch,
  HiOutlineFire,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

export const navLinks: NavItem[] = [
  {
    label: "Discover",
    href: "/",
    active: true,
    icon: <HiOutlineSquares2X2 />,
  },

  {
    label: "Categories",
    href: "/categories",
    icon: <HiOutlineFolder />,
    children: [
      {
        label: "AI Writing",
        href: "/categories/ai-writing",
        icon: <HiOutlineDocumentText />,
      },
      {
        label: "AI Video Generators",
        href: "/categories/ai-video-generators",
        icon: <HiOutlineVideoCamera />,
      },
      {
        label: "AI Image Generators",
        href: "/categories/ai-image-generators",
        icon: <HiOutlinePhoto />,
      },
      {
        label: "AI Coding Assistants",
        href: "/categories/ai-coding",
        icon: <HiOutlineCodeBracket />,
      },
      {
        label: "AI Research Tools",
        href: "/categories/ai-research",
        icon: <HiOutlineSparkles />,
      },
      {
        label: "AI Voice Tools",
        href: "/categories/ai-voice",
        icon: <HiOutlineMicrophone />,
      },
    ],
  },

  {
    label: "Compare",
    href: "/compare",
    icon: <HiOutlineScale />,
    children: [
      {
        label: "ChatGPT vs Claude",
        href: "/compare/chatgpt-vs-claude",
        icon: <HiOutlineScale />,
      },
      {
        label: "Cursor vs Windsurf",
        href: "/compare/cursor-vs-windsurf",
        icon: <HiOutlineScale />,
      },
      {
        label: "Midjourney vs DALL·E",
        href: "/compare/midjourney-vs-dalle",
        icon: <HiOutlineScale />,
      },
    ],
  },

  {
    label: "Alternatives",
    href: "/alternatives",
    icon: <HiOutlineSparkles />,
    children: [
      {
        label: "ChatGPT Alternatives",
        href: "/alternatives/chatgpt",
        icon: <HiOutlineSparkles />,
      },
      {
        label: "Midjourney Alternatives",
        href: "/alternatives/midjourney",
        icon: <HiOutlineSparkles />,
      },
    ],
  },

  {
    label: "Trending",
    href: "/trending",
    badge: "Live",
    icon: <HiOutlineArrowTrendingUp />,
    children: [
      {
        label: "Trending Today",
        href: "/trending/today",
        icon: <HiOutlineFire />,
      },
      {
        label: "Top Rated Tools",
        href: "/top-rated",
        icon: <HiOutlineRocketLaunch />,
      },
      {
        label: "New Launches",
        href: "/new",
        icon: <HiOutlineSparkles />,
      },
    ],
  },

  {
    label: "Resources",
    href: "/resources",
    icon: <HiOutlineBookOpen />,
    children: [
      {
        label: "Blog",
        href: "/blog",
        icon: <HiOutlineBookOpen />,
      },
      {
        label: "API Docs",
        href: "/docs",
        icon: <HiOutlineCodeBracket />,
      },
      {
        label: "Guides",
        href: "/guides",
        icon: <HiOutlineDocumentText />,
      },
    ],
  },

  {
    label: "Community",
    href: "/community",
    icon: <HiOutlineUsers />,
    children: [
      {
        label: "Submit Tool",
        href: "/submit",
        icon: <HiOutlineRocketLaunch />,
      },
      {
        label: "Advertise",
        href: "/advertise",
        icon: <HiOutlineSparkles />,
      },
    ],
  },

  {
    label: "Company",
    href: "/company",
    icon: <HiOutlineBuildingOffice2 />,
    children: [
      {
        label: "About Us",
        href: "/about",
        icon: <HiOutlineBuildingOffice2 />,
      },
      {
        label: "Contact",
        href: "/contact",
        icon: <HiOutlineUsers />,
      },
      {
        label: "Privacy Policy",
        href: "/privacy",
        icon: <HiOutlineShieldCheck />,
      },
    ],
  },
];
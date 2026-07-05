import type { NavItem } from "../types/navigation";
import {
  HiOutlineSquares2X2,
  HiOutlineScale,
  // HiOutlineArrowTrendingUp,
  HiOutlineSparkles,
  HiOutlineFolder,
  // HiOutlineBookOpen,
  HiOutlineUsers,
  // HiOutlineBuildingOffice2,
  HiOutlineCodeBracket,
  HiOutlineVideoCamera,
  HiOutlinePhoto,
  HiOutlineMicrophone,
  HiOutlineDocumentText,
  HiOutlineRocketLaunch,
  // HiOutlineFire,
  // HiOutlineShieldCheck,
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
        href: "/category/ai-writing",
        icon: <HiOutlineDocumentText />,
      },
      {
        label: "AI Video Generators",
        href: "/category/ai-video",
        icon: <HiOutlineVideoCamera />,
      },
      {
        label: "AI Image Generators",
        href: "/category/ai-image-generator",
        icon: <HiOutlinePhoto />,
      },
      {
        label: "AI Coding Assistants",
        href: "/category/ai-coding",
        icon: <HiOutlineCodeBracket />,
      },
      {
        label: "AI Research Tools",
        href: "/category/ai-productivity",
        icon: <HiOutlineSparkles />,
      },
      {
        label: "AI Voice Tools",
        href: "/category/ai-voice",
        icon: <HiOutlineMicrophone />,
      },
      {
        label: "AI Marketing",
        href: "/category/ai-marketing",
        icon: <HiOutlineRocketLaunch />,
      },
      {
        label: "Chatbots",
        href: "/category/chatbots",
        icon: <HiOutlineUsers />,
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
  // {
  //   label: "Trending",
  //   href: "/trending",
  //   badge: "Live",
  //   icon: <HiOutlineArrowTrendingUp />,
  //   children: [
  //     {
  //       label: "Trending Today",
  //       href: "/trending/today",
  //       icon: <HiOutlineFire />,
  //     },
  //     {
  //       label: "Top Rated Tools",
  //       href: "/top-rated",
  //       icon: <HiOutlineRocketLaunch />,
  //     },
  //     {
  //       label: "New Launches",
  //       href: "/new",
  //       icon: <HiOutlineSparkles />,
  //     },
  //   ],
  // },
  // {
  //   label: "Resources",
  //   href: "/resources",
  //   icon: <HiOutlineBookOpen />,
  //   children: [
  //     {
  //       label: "Blog",
  //       href: "/blog",
  //       icon: <HiOutlineBookOpen />,
  //     },
  //     {
  //       label: "API Docs",
  //       href: "/docs",
  //       icon: <HiOutlineCodeBracket />,
  //     },
  //     {
  //       label: "Guides",
  //       href: "/guides",
  //       icon: <HiOutlineDocumentText />,
  //     },
  //   ],
  // },
  // {
  //   label: "Community",
  //   href: "/community",
  //   icon: <HiOutlineUsers />,
  //   children: [
  //     {
  //       label: "Submit Tool",
  //       href: "/submit",
  //       icon: <HiOutlineRocketLaunch />,
  //     },
  //     {
  //       label: "Advertise",
  //       href: "/advertise",
  //       icon: <HiOutlineSparkles />,
  //     },
  //   ],
  // },
  // {
  //   label: "Company",
  //   href: "/company",
  //   icon: <HiOutlineBuildingOffice2 />,
  //   children: [
  //     {
  //       label: "About Us",
  //       href: "/about",
  //       icon: <HiOutlineBuildingOffice2 />,
  //     },
  //     {
  //       label: "Contact",
  //       href: "/contact",
  //       icon: <HiOutlineUsers />,
  //     },
  //     {
  //       label: "Privacy Policy",
  //       href: "/privacy",
  //       icon: <HiOutlineShieldCheck />,
  //     },
  //   ],
  // },
];
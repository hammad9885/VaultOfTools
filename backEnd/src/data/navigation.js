const navigation = {
  navLinks: [
    { label: "Discover", href: "/discover" },
    { label: "Categories", href: "/categories" },
    { label: "Compare", href: "/compare" },
    { label: "Tools reviews", href: "/toolsreview" },
    { label: "Blog", href: "/blog" },
    { label: "Consulting", href: "/consulting" },
  ],
  footer: {
    platform: [
      { label: "Discover", href: "/discover" },
      { label: "Categories", href: "/categories" },
      { label: "Compare", href: "/compare" },
      { label: "Tools reviews", href: "/toolsreview" },
      { label: "Blog", href: "/blog" },
    ],
    community: [
      { label: "Submit a Tool", href: "/submit" },
      { label: "Write a Review", href: "/toolsreview" },
      { label: "Newsletter", href: "/blog#nl-cta" },
      { label: "Blog", href: "/blog" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
};

const popularComparisonsSidebar = [
  "ChatGPT vs Claude",
  "Midjourney vs DALL·E",
  "Notion AI vs ClickUp AI",
  "Jasper vs Copy.ai",
  "Zapier vs Make",
];

const trendingToolsSidebar = [
  "ChatGPT",
  "Claude",
  "Midjourney",
  "Notion AI",
  "Perplexity",
];

module.exports = { navigation, popularComparisonsSidebar, trendingToolsSidebar };

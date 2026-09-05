export const allComparisons = [
  { slug: "chatgpt-vs-claude", a: "ChatGPT-4o", b: "Claude 3.5 Sonnet", category: "AI Chatbots", votes: 4821 },
  { slug: "midjourney-vs-dalle", a: "Midjourney v6", b: "DALL·E 3", category: "Image Generation", votes: 3102 },
  { slug: "copilot-vs-cursor", a: "GitHub Copilot", b: "Cursor", category: "Coding", votes: 2874 },
  { slug: "notion-ai-vs-mem", a: "Notion AI", b: "Mem", category: "Productivity", votes: 1954 },
  { slug: "jasper-vs-copyai", a: "Jasper", b: "Copy.ai", category: "AI Writing", votes: 1432 },
  { slug: "runway-vs-pika", a: "Runway", b: "Pika Labs", category: "Video", votes: 1287 },
  { slug: "gemini-vs-chatgpt", a: "Google Gemini", b: "ChatGPT-4o", category: "AI Chatbots", votes: 3341 },
  { slug: "perplexity-vs-you", a: "Perplexity", b: "You.com", category: "Search", votes: 987 },
];

export const alternatives = [
  { name: "ChatGPT", count: 12 },
  { name: "Midjourney", count: 8 },
  { name: "GitHub Copilot", count: 9 },
  { name: "Notion AI", count: 7 },
  { name: "Jasper", count: 11 },
  { name: "Runway", count: 6 },
];

export const filterTabs = ["All", "AI Chatbots", "Image Generation", "Coding", "Productivity", "AI Writing", "Video", "Search"];

export const howItWorks = [
  { icon: "Search", title: "Choose tools to compare", desc: "Select two AI tools from our extensive database to see a detailed side-by-side comparison." },
  { icon: "Check", title: "Compare features", desc: "Review our detailed feature comparison covering pricing, capabilities, integrations and more." },
  { icon: "Zap", title: "Make the right choice", desc: "Use our community-driven pros/cons and ratings to pick the best tool for your needs." },
];

export const comparisonDetails: Record<string, any> = {
  "claude-3.5-sonnet-vs-chatgpt-4o": {
    a: "Claude 3.5 Sonnet",
    b: "ChatGPT-4o",
    slug: "claude-3.5-sonnet-vs-chatgpt-4o",
    category: "AI Chatbots & LLMs",
    ratingA: 4.9,
    ratingB: 4.8,
    pricingA: "Freemium",
    pricingB: "Freemium",
    rows: [
      { label: "Overall Rating", a: "4.9", b: "4.8" },
      { label: "Coding & Reasoning", a: "9.8 / 10", b: "9.3 / 10" },
      { label: "Context Window", a: "200,000 tokens", b: "128,000 tokens" },
      { label: "Starting Price", a: "Free / $20 mo", b: "Free / $20 mo" },
      { label: "Free Tier", a: "Yes", b: "Yes" },
      { label: "Live Artifacts Preview", a: "Yes", b: "No" },
      { label: "Image Generation", a: "No", b: "Yes (DALL·E 3)" },
      { label: "Advanced Voice Mode", a: "No", b: "Yes" },
      { label: "API Access", a: "Yes", b: "Yes" },
      { label: "Team & Enterprise Plans", a: "Yes", b: "Yes" },
      { label: "Document Analysis", a: "Superior", b: "Excellent" },
      { label: "Web Browsing", a: "No", b: "Yes" },
    ],
    prosA: [
      "Industry-leading code generation and architectural reasoning",
      "Interactive Artifacts UI for live React, HTML, and SVG previewing",
      "Massive 200k context window with superior document recall",
      "Nuanced, natural writing without cliché AI corporate phrasing",
    ],
    prosB: [
      "Native image generation powered by integrated DALL·E 3",
      "Real-time expressive Advanced Voice Mode with zero lag",
      "Integrated web browsing with search citations",
      "Massive library of custom GPTs and community plugins",
    ],
  },
  "chatgpt-vs-claude": {
    a: "ChatGPT-4o",
    b: "Claude 3.5 Sonnet",
    slug: "chatgpt-vs-claude",
    category: "AI Chatbots & LLMs",
    ratingA: 4.8,
    ratingB: 4.9,
    pricingA: "Freemium",
    pricingB: "Freemium",
    rows: [
      { label: "Overall Rating", a: "4.8", b: "4.9" },
      { label: "Coding & Reasoning", a: "9.3 / 10", b: "9.8 / 10" },
      { label: "Context Window", a: "128,000 tokens", b: "200,000 tokens" },
      { label: "Starting Price", a: "Free / $20 mo", b: "Free / $20 mo" },
      { label: "Free Tier", a: "Yes", b: "Yes" },
      { label: "Image Generation", a: "Yes (DALL·E 3)", b: "No" },
      { label: "Advanced Voice Mode", a: "Yes", b: "No" },
      { label: "Live Artifacts Preview", a: "No", b: "Yes" },
      { label: "API Access", a: "Yes", b: "Yes" },
      { label: "Team & Enterprise Plans", a: "Yes", b: "Yes" },
      { label: "Document Analysis", a: "Excellent", b: "Superior" },
      { label: "Web Browsing", a: "Yes", b: "No" },
    ],
    prosA: [
      "Native image generation powered by integrated DALL·E 3",
      "Real-time expressive Advanced Voice Mode with zero lag",
      "Integrated web browsing with search citations",
      "Massive library of custom GPTs and community plugins",
    ],
    prosB: [
      "Industry-leading code generation and architectural reasoning",
      "Interactive Artifacts UI for live React, HTML, and SVG previewing",
      "Massive 200k context window with superior document recall",
      "Nuanced, natural writing without cliché AI corporate phrasing",
    ],
  },
};

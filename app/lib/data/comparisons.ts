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
  "chatgpt-vs-claude": {
    a: "ChatGPT-4o",
    b: "Claude 3.5 Sonnet",
    slug: "chatgpt-vs-claude",
    rows: [
      { label: "Starting Price", a: "Free / $20 mo", b: "Free / $20 mo" },
      { label: "Free Tier", a: "Yes", b: "Yes" },
      { label: "Context Window", a: "128k", b: "200k" },
      { label: "API Access", a: "Yes", b: "Yes" },
      { label: "Team Plans", a: "Yes", b: "Yes" },
      { label: "Best For", a: "General writing", b: "Long-form & coding" },
    ],
    prosA: ["Multimodal output and image generation", "Broader plugin ecosystem", "Large developer community"],
    prosB: ["Long-form writing and code generation", "Larger context window", "Better at following complex instructions"],
  },
};

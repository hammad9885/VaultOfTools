/** Homepage demo / featured tools linked from Trending cards. */

export type HomepageToolSeed = {
  name: string;
  slug: string;
  category: string;
  pricing: "Free" | "Freemium" | "Paid";
  rating: number;
  reviews: number;
  upvotes: number;
  desc: string;
  website: string;
  tags: string[];
  features: string[];
  pros: string[];
  cons: string[];
};

export const homepageFeaturedTools: HomepageToolSeed[] = [
  {
    name: "Flux Studio",
    slug: "flux-studio",
    category: "Image Generation",
    pricing: "Free",
    rating: 4.9,
    reviews: 128,
    upvotes: 1280,
    desc: "Create photorealistic imagery with the latest open-source generative model architecture.",
    website: "https://blackforestlabs.ai",
    tags: ["Image", "Generative", "Design"],
    features: [
      "Photorealistic image generation",
      "Multiple aspect ratios and styles",
      "Fast inference for drafts",
      "Export-ready high resolution outputs",
    ],
    pros: ["Strong image quality", "Good for product mockups"],
    cons: ["Prompt tuning can take practice"],
  },
  {
    name: "CodeWhisper",
    slug: "codewhisper",
    category: "Developer Tools",
    pricing: "Freemium",
    rating: 4.7,
    reviews: 850,
    upvotes: 2100,
    desc: "Real-time code completion and security scanning across 15+ programming languages.",
    website: "https://aws.amazon.com/codewhisperer",
    tags: ["Coding", "IDE", "Security"],
    features: [
      "Inline code suggestions",
      "Multi-language support",
      "Security scanning hints",
      "IDE integrations",
    ],
    pros: ["Speeds up boilerplate", "Helpful in unfamiliar codebases"],
    cons: ["Suggestions still need review"],
  },
  {
    name: "MotionFlow",
    slug: "motionflow",
    category: "Video Editing",
    pricing: "Paid",
    rating: 4.8,
    reviews: 312,
    upvotes: 980,
    desc: "Automate B-roll and subtitle generation with one-click cinematic style transfers.",
    website: "https://runwayml.com",
    tags: ["Video", "Editing", "Subtitles"],
    features: [
      "Auto B-roll suggestions",
      "Subtitle generation",
      "Style transfer presets",
      "Timeline-friendly exports",
    ],
    pros: ["Saves editing time", "Clean subtitle workflow"],
    cons: ["Best results on paid plans"],
  },
  {
    name: "SynthFlow",
    slug: "synthflow",
    category: "Voice Synthesis",
    pricing: "Freemium",
    rating: 4.9,
    reviews: 421,
    upvotes: 1450,
    desc: "Studio-quality voiceovers in seconds with realistic neural speech engines.",
    website: "https://elevenlabs.io",
    tags: ["Voice", "Audio", "TTS"],
    features: [
      "Natural neural voices",
      "Multi-language narration",
      "Voice cloning options",
      "Fast render times",
    ],
    pros: ["Very realistic voices", "Great for creators"],
    cons: ["Usage limits on free tier"],
  },
  {
    name: "Lumina Script",
    slug: "lumina-script",
    category: "AI Writing",
    pricing: "Free",
    rating: 4.6,
    reviews: 198,
    upvotes: 760,
    desc: "Long-form narrative consistency and world-building powered by orchestrated LLMs.",
    website: "https://sudowrite.com",
    tags: ["Writing", "Story", "Creative"],
    features: [
      "Long-form narrative assistance",
      "Character and world consistency",
      "Outline-to-draft workflows",
      "Rewrite and expand tools",
    ],
    pros: ["Helpful for fiction writers", "Keeps story context"],
    cons: ["Creative output still needs editing"],
  },
  {
    name: "InsightLayer",
    slug: "insightlayer",
    category: "Analytics",
    pricing: "Paid",
    rating: 4.8,
    reviews: 264,
    upvotes: 890,
    desc: "Turn complex business data into readable narratives and actionable reports automatically.",
    website: "https://www.tableau.com",
    tags: ["Analytics", "BI", "Reports"],
    features: [
      "Automated data narratives",
      "Actionable report summaries",
      "Dashboard-friendly insights",
      "Anomaly highlighting",
    ],
    pros: ["Makes data easier to explain", "Good for stakeholders"],
    cons: ["Needs clean source data"],
  },
];

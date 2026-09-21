export type ComparisonRow = {
  label: string;
  a: string;
  b: string;
  type?: "text" | "number" | "boolean" | "higher" | "lower";
};

export type ComparisonFAQ = {
 question: string;
  answer: string;
};

export type Comparison = {
  slug: string;
  a: {
    name: string;
    slug: string;
  };
  b: {
    name: string;
    slug: string;
  };
  category: string;
  votes: number;
  ratingA?: number;
  ratingB?: number;
  pricingA?: string;
  pricingB?: string;
  rows: ComparisonRow[];
  prosA: string[];
  prosB: string[];
  faq: ComparisonFAQ[];
};

export const allComparisons: Comparison[] = [
  {
    slug: "chatgpt-vs-claude",
    a: {
      name: "ChatGPT",
      slug: "chatgpt",
    },
    b: {
      name: "Claude",
      slug: "claude",
    },
    category: "AI Chatbots",
    votes: 4821,
    ratingA: 4.8,
    ratingB: 4.9,
    pricingA: "Freemium",
    pricingB: "Freemium",
    rows: [
      {
        label: "Overall Rating",
        a: "4.8",
        b: "4.9",
        type: "higher",
      },
      {
        label: "Coding & Reasoning",
        a: "9.3 / 10",
        b: "9.8 / 10",
        type: "higher",
      },
      {
        label: "Context Window",
        a: "128,000 tokens",
        b: "200,000 tokens",
        type: "higher",
      },
      {
        label: "Starting Price",
        a: "Free / $20 mo",
        b: "Free / $20 mo",
        type: "text",
      },
      {
        label: "Free Plan",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "API Available",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Image Generation",
        a: "Yes",
        b: "No",
        type: "boolean",
      },
      {
        label: "Advanced Voice",
        a: "Yes",
        b: "No",
        type: "boolean",
      },
      {
        label: "Web Browsing",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Document Analysis",
        a: "Excellent",
        b: "Excellent",
        type: "text",
      },
      {
        label: "Team Plans",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Strong multimodal capabilities",
      "Native image generation",
      "Real-time voice interaction",
      "Web browsing and research features",
    ],
    prosB: [
      "Strong coding and reasoning performance",
      "Large context window",
      "Excellent long-document analysis",
      "Artifacts and structured workspace features",
    ],
    faq: [
      {
        question: "Which tool is better for coding?",
        answer:
          "Both tools support software development and code generation. Claude is particularly useful for long codebases and structured reasoning, while ChatGPT provides a broader set of multimodal and interactive capabilities.",
      },
      {
        question: "Which tool has the larger context window?",
        answer:
          "In this comparison dataset, Claude is listed with a 200,000-token context window while ChatGPT is listed with 128,000 tokens.",
      },
      {
        question: "Do both tools offer free plans?",
        answer:
          "Yes. Both tools are represented as having free access options in this comparison.",
      },
      {
        question: "Can both tools generate images?",
        answer:
          "ChatGPT is represented as supporting native image generation in this comparison, while Claude is not.",
      },
    ],
  },
  {
    slug: "midjourney-vs-dalle",
    a: {
      name: "Midjourney",
      slug: "midjourney",
    },
    b: {
      name: "DALL·E",
      slug: "dalle",
    },
    category: "Image Generation",
    votes: 3102,
    ratingA: 4.8,
    ratingB: 4.6,
    pricingA: "Paid",
    pricingB: "Usage Based",
    rows: [
      {
        label: "Overall Rating",
        a: "4.8",
        b: "4.6",
        type: "higher",
      },
      {
        label: "Image Generation",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Text Rendering",
        a: "Excellent",
        b: "Excellent",
        type: "text",
      },
      {
        label: "API Available",
        a: "No",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Free Plan",
        a: "No",
        b: "Limited",
        type: "text",
      },
      {
        label: "Web App",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Strong artistic image generation",
      "Detailed visual styles",
      "Excellent creative exploration",
      "Large creative community",
    ],
    prosB: [
      "Easy natural-language prompting",
      "Strong text integration",
      "API access",
      "Works well inside broader AI workflows",
    ],
    faq: [
      {
        question: "Which tool is designed for image generation?",
        answer:
          "Both Midjourney and DALL·E are image-generation systems. Their workflows, interfaces and available capabilities differ.",
      },
      {
        question: "Does DALL·E provide API access?",
        answer:
          "The comparison dataset lists DALL·E as supporting API access.",
      },
    ],
  },
  {
    slug: "copilot-vs-cursor",
    a: {
      name: "GitHub Copilot",
      slug: "github-copilot",
    },
    b: {
      name: "Cursor",
      slug: "cursor",
    },
    category: "Coding",
    votes: 2874,
    ratingA: 4.7,
    ratingB: 4.8,
    pricingA: "Freemium",
    pricingB: "Freemium",
    rows: [
      {
        label: "Overall Rating",
        a: "4.7",
        b: "4.8",
        type: "higher",
      },
      {
        label: "Code Completion",
        a: "Excellent",
        b: "Excellent",
        type: "text",
      },
      {
        label: "Codebase Understanding",
        a: "Excellent",
        b: "Superior",
        type: "text",
      },
      {
        label: "Free Plan",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "API Available",
        a: "Yes",
        b: "No",
        type: "boolean",
      },
      {
        label: "IDE Integration",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Deep GitHub ecosystem integration",
      "Broad IDE support",
      "Strong autocomplete",
      "Useful for everyday development",
    ],
    prosB: [
      "AI-first coding environment",
      "Strong codebase context",
      "Agentic coding workflows",
      "Integrated AI editing experience",
    ],
    faq: [
      {
        question: "What is the main difference between Copilot and Cursor?",
        answer:
          "GitHub Copilot focuses heavily on AI-assisted development across supported editors, while Cursor is an AI-first coding environment with deeper integrated editing workflows.",
      },
      {
        question: "Do both tools have free access?",
        answer:
          "The comparison dataset lists free access options for both products.",
      },
    ],
  },
  {
    slug: "notion-ai-vs-mem",
    a: {
      name: "Notion AI",
      slug: "notion-ai",
    },
    b: {
      name: "Mem",
      slug: "mem",
    },
    category: "Productivity",
    votes: 1954,
    ratingA: 4.5,
    ratingB: 4.3,
    pricingA: "Paid",
    pricingB: "Paid",
    rows: [
      {
        label: "Overall Rating",
        a: "4.5",
        b: "4.3",
        type: "higher",
      },
      {
        label: "AI Writing",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Knowledge Management",
        a: "Excellent",
        b: "Excellent",
        type: "text",
      },
      {
        label: "Team Collaboration",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Templates",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Strong workspace ecosystem",
      "Documents and databases in one platform",
      "Excellent collaboration features",
      "Large template ecosystem",
    ],
    prosB: [
      "AI-focused personal knowledge management",
      "Fast capture workflows",
      "Automatic organization",
      "Strong memory-oriented workflow",
    ],
    faq: [
      {
        question: "What are Notion AI and Mem used for?",
        answer:
          "Both products can support knowledge management and AI-assisted productivity, but their workflows and workspace models differ.",
      },
    ],
  },
  {
    slug: "jasper-vs-copyai",
    a: {
      name: "Jasper",
      slug: "jasper",
    },
    b: {
      name: "Copy.ai",
      slug: "copy-ai",
    },
    category: "AI Writing",
    votes: 1432,
    ratingA: 4.5,
    ratingB: 4.4,
    pricingA: "Paid",
    pricingB: "Freemium",
    rows: [
      {
        label: "Overall Rating",
        a: "4.5",
        b: "4.4",
        type: "higher",
      },
      {
        label: "AI Writing",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Marketing Workflows",
        a: "Excellent",
        b: "Excellent",
        type: "text",
      },
      {
        label: "Team Collaboration",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Free Plan",
        a: "No",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Marketing-focused AI workflows",
      "Brand voice controls",
      "Strong content creation features",
      "Team-oriented workflows",
    ],
    prosB: [
      "Workflow automation",
      "Flexible AI writing tools",
      "Strong sales and marketing use cases",
      "Accessible entry-level plan",
    ],
    faq: [
      {
        question: "Are Jasper and Copy.ai writing tools?",
        answer:
          "Yes. Both platforms provide AI-powered writing and marketing workflows.",
      },
    ],
  },
  {
    slug: "runway-vs-pika",
    a: {
      name: "Runway",
      slug: "runway",
    },
    b: {
      name: "Pika",
      slug: "pika",
    },
    category: "Video",
    votes: 1287,
    ratingA: 4.7,
    ratingB: 4.4,
    pricingA: "Freemium",
    pricingB: "Freemium",
    rows: [
      {
        label: "Overall Rating",
        a: "4.7",
        b: "4.4",
        type: "higher",
      },
      {
        label: "Text-to-Video",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Image-to-Video",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Video Editing",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Free Plan",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Advanced generative video workflows",
      "Professional creative controls",
      "Video editing tools",
      "Strong production workflow",
    ],
    prosB: [
      "Simple generative video workflow",
      "Fast creative experimentation",
      "Accessible interface",
      "Useful image-to-video features",
    ],
    faq: [
      {
        question: "Can both tools generate video from text?",
        answer:
          "The comparison dataset lists text-to-video support for both platforms.",
      },
    ],
  },
  {
    slug: "gemini-vs-chatgpt",
    a: {
      name: "Google Gemini",
      slug: "gemini",
    },
    b: {
      name: "ChatGPT",
      slug: "chatgpt",
    },
    category: "AI Chatbots",
    votes: 3341,
    ratingA: 4.7,
    ratingB: 4.8,
    pricingA: "Freemium",
    pricingB: "Freemium",
    rows: [
      {
        label: "Overall Rating",
        a: "4.7",
        b: "4.8",
        type: "higher",
      },
      {
        label: "Multimodal",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Image Generation",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Web Search",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Free Plan",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "API Available",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Strong Google ecosystem integration",
      "Multimodal capabilities",
      "Useful research workflows",
      "Large-context workflows",
    ],
    prosB: [
      "Broad multimodal capabilities",
      "Strong conversational workflows",
      "Image generation",
      "Large ecosystem of AI features",
    ],
    faq: [
      {
        question: "Do Gemini and ChatGPT support multimodal workflows?",
        answer:
          "Yes. Both platforms provide multimodal capabilities, although their exact features and integrations can differ by plan and model.",
      },
    ],
  },
  {
    slug: "perplexity-vs-you",
    a: {
      name: "Perplexity",
      slug: "perplexity",
    },
    b: {
      name: "You.com",
      slug: "you",
    },
    category: "AI Search",
    votes: 987,
    ratingA: 4.6,
    ratingB: 4.2,
    pricingA: "Freemium",
    pricingB: "Freemium",
    rows: [
      {
        label: "Overall Rating",
        a: "4.6",
        b: "4.2",
        type: "higher",
      },
      {
        label: "Web Search",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Citations",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "AI Answers",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
      {
        label: "Free Plan",
        a: "Yes",
        b: "Yes",
        type: "boolean",
      },
    ],
    prosA: [
      "Search-first AI experience",
      "Strong citation workflow",
      "Research-focused interface",
      "Fast answers with sources",
    ],
    prosB: [
      "AI-powered search",
      "Multiple search modes",
      "Research workflows",
      "Customizable AI experience",
    ],
    faq: [
      {
        question: "Are Perplexity and You.com AI search platforms?",
        answer:
          "Yes. Both platforms combine web search with AI-generated responses and research-oriented workflows.",
      },
    ],
  },
];

export const alternatives = [
  { name: "ChatGPT", slug: "chatgpt", count: 12 },
  { name: "Midjourney", slug: "midjourney", count: 8 },
  { name: "GitHub Copilot", slug: "github-copilot", count: 9 },
  { name: "Notion AI", slug: "notion-ai", count: 7 },
  { name: "Jasper", slug: "jasper", count: 11 },
  { name: "Runway", slug: "runway", count: 6 },
];

export const filterTabs = [
  "All",
  "AI Chatbots",
  "Image Generation",
  "Coding",
  "Productivity",
  "AI Writing",
  "Video",
  "AI Search",
];

export const howItWorks = [
  {
    icon: "Search",
    title: "Choose two tools",
    desc: "Select two tools from the comparison directory.",
  },
  {
    icon: "Check",
    title: "Compare capabilities",
    desc: "Review pricing, features, capabilities and important differences.",
  },
  {
    icon: "Zap",
    title: "Make an informed decision",
    desc: "Use the comparison data to identify which capabilities match your needs.",
  },
];

export function getComparisonBySlug(slug: string) {
  return allComparisons.find((comparison) => comparison.slug === slug);
}

export function getComparisonByTools(
  toolASlug: string,
  toolBSlug: string
) {
  const normalizedA = toolASlug.toLowerCase();
  const normalizedB = toolBSlug.toLowerCase();

  return allComparisons.find(
    (comparison) =>
      (comparison.a.slug === normalizedA &&
        comparison.b.slug === normalizedB) ||
      (comparison.a.slug === normalizedB &&
        comparison.b.slug === normalizedA)
  );
}

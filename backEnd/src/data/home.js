const stats = [
  { value: "10K", suffix: "+", label: "AI Tools", icon: "Cpu" },
  { value: "250", suffix: "+", label: "Categories", icon: "Layers" },
  { value: "50K", suffix: "+", label: "Reviews", icon: "Star" },
  { value: "2M", suffix: "+", label: "Users", icon: "Users" },
];

const comparisons = [
  { label: "ChatGPT vs Claude" },
  { label: "Midjourney vs DALL·E" },
  { label: "Copilot vs Cursor" },
  { label: "Notion AI vs Mem" },
];

const faqs = [
  { q: "How do I submit an AI tool?", a: "Click the 'Submit Tool' button on our navigation bar, fill out the form with your tool's details, and our editorial team will review your submission within 48 hours." },
  { q: "Are the reviews unbiased?", a: "Yes, we pride ourselves on our editorial independence. Our review team evaluates tools based on strict criteria, and we clearly label any sponsored content." },
  { q: "How often is the directory updated?", a: "We update our directory daily with new tools, updated reviews, and fresh comparisons. Our editorial team continuously monitors the AI landscape." },
  { q: "Can I trust the ratings?", a: "All ratings are based on thorough testing by our expert review team combined with real user feedback. We never accept payment for positive reviews." },
  { q: "Do I need an account to browse?", a: "No, you can browse all tools, reviews, and comparisons without an account. Accounts are only needed if you want to submit a tool or write a review." },
  { q: "What makes this site different?", a: "We're the only AI directory that combines expert reviews with real user ratings, detailed comparisons, and personalized recommendations — all in one place." },
  { q: "How do you verify submitted tools?", a: "Each submission goes through a verification process where we check the tool's functionality, pricing accuracy, and collect initial review data before listing." },
  { q: "Can I report inaccurate information?", a: "Yes, every tool page has a 'Report' option. Our team reviews all reports within 24 hours and updates any verified inaccuracies." },
];

const trending = [
  { name: "Flux Studio", logo: null, pricing: "Freemium", rating: 4.7, reviews: 312, desc: "AI-powered design and prototyping tool for modern teams.", website: "#" },
  { name: "CodeWhisper", logo: null, pricing: "Free", rating: 4.8, reviews: 289, desc: "AI code review and suggestion engine for development teams.", website: "#" },
  { name: "MotionFlow", logo: null, pricing: "Paid", rating: 4.6, reviews: 245, desc: "Automated video creation and motion graphics platform.", website: "#" },
  { name: "SynthFlow", logo: null, pricing: "Freemium", rating: 4.5, reviews: 198, desc: "AI music and audio generation for content creators.", website: "#" },
  { name: "Lumina Script", logo: null, pricing: "Free", rating: 4.9, reviews: 167, desc: "AI screenwriting and story development assistant.", website: "#" },
  { name: "InsightLayer", logo: null, pricing: "Paid", rating: 4.4, reviews: 156, desc: "Business intelligence AI that uncovers hidden patterns in your data.", website: "#" },
];

module.exports = { stats, comparisons, faqs, trending };

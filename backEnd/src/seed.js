require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Review = require("./models/Review");
const Tool = require("./models/Tool");
const Submission = require("./models/Submission");

const tools = [
  {
    slug: "flux-studio", name: "Flux Studio", category: "Image Generation",
    pricing: "Free", rating: 4.9, reviews: 128,
    desc: "Create photorealistic imagery with the latest open-source generative model architecture.",
    website: "https://fluxstudio.ai",
    features: ["API access with simple key auth", "Team workspaces and shared libraries", "Export to PNG, SVG, and JSON", "Integrations with Slack, Notion, Zapier"],
    pros: ["Fast and responsive", "Generous free tier", "Strong community support", "Regular updates"],
    cons: ["Limited offline mode", "Advanced features require Pro plan"],
    tags: ["#text to image", "#image editing"],
  },
  {
    slug: "codewhisper", name: "CodeWhisper", category: "Developer Tools",
    pricing: "Freemium", rating: 4.7, reviews: 850,
    desc: "Real-time code completion and security scanning across 15+ programming languages.",
    website: "https://codewhisper.dev",
    features: ["Multi-language support", "Security vulnerability scanning", "VS Code extension", "Team analytics dashboard"],
    pros: ["Excellent autocomplete", "Security scanning catches real issues", "Supports many languages"],
    cons: ["Can be resource heavy", "Free tier limited"],
    tags: ["#code assistant", "#developer tools"],
  },
  {
    slug: "motionflow", name: "MotionFlow", category: "Video Editing",
    pricing: "Paid", rating: 4.8, reviews: 312,
    desc: "Automate B-roll and subtitle generation with one-click cinematic style transfers.",
    website: "https://motionflow.ai",
    features: ["Auto B-roll generation", "Style transfer presets", "Subtitle automation", "Export in 4K"],
    pros: ["Style transfer presets save time", "Professional output quality"],
    cons: ["Export queue could be faster", "Premium pricing"],
    tags: ["#video generators", "#creative"],
  },
  {
    slug: "synthflow", name: "SynthFlow", category: "Voice Synthesis",
    pricing: "Freemium", rating: 4.9, reviews: 421,
    desc: "Studio-quality voiceovers in seconds with realistic neural speech engines.",
    website: "https://synthflow.ai",
    features: ["Neural voice synthesis", "Multi-language support", "Custom voice cloning", "API access"],
    pros: ["Natural sounding voices", "Low latency", "Good API docs"],
    cons: ["Limited free voices", "Cloning requires paid plan"],
    tags: ["#text to speech", "#audio", "#ai voices"],
  },
  {
    slug: "lumina-script", name: "Lumina Script", category: "AI Writing",
    pricing: "Free", rating: 4.6, reviews: 198,
    desc: "Long-form narrative consistency and world-building powered by orchestrated LLMs.",
    website: "https://luminascript.ai",
    features: ["Character consistency tracking", "World-building tools", "Chapter planning", "Export to multiple formats"],
    pros: ["Great for long-form writing", "Character tracking is excellent"],
    cons: ["UI can be complex", "Limited templates"],
    tags: ["#writing generators", "#creative"],
  },
  {
    slug: "insightlayer", name: "InsightLayer", category: "Analytics",
    pricing: "Paid", rating: 4.8, reviews: 264,
    desc: "Turn complex business data into readable narratives and actionable reports automatically.",
    website: "https://insightlayer.ai",
    features: ["Automated reporting", "Data narrative generation", "Dashboard integration", "Team collaboration"],
    pros: ["Makes data accessible", "Clean report output", "Saves hours of work"],
    cons: ["Expensive for small teams", "Limited data source connectors"],
    tags: ["#analytics", "#reporting"],
  },
];

const demoUser = {
  email: "demo@vaultoftools.com",
  password: "demo123456",
  displayName: "Demo User",
  role: "admin",
};

const reviewSeeds = [
  { toolSlug: "flux-studio", rating: 5, text: "Cut my image production time in half. The output quality genuinely surprised me on the first try.", helpful: 34 },
  { toolSlug: "codewhisper", rating: 4, text: "Solid autocomplete and the security scanning has already flagged two real issues in our codebase.", helpful: 29 },
  { toolSlug: "motionflow", rating: 5, text: "The style transfer presets save so much editing time. Wish the export queue was a bit faster.", helpful: 19 },
  { toolSlug: "synthflow", rating: 4, text: "Voiceovers sound natural enough that clients stopped asking if it was AI-generated.", helpful: 12 },
  { toolSlug: "lumina-script", rating: 5, text: "Helped me keep character details consistent across a 40-chapter draft without a spreadsheet.", helpful: 9 },
  { toolSlug: "insightlayer", rating: 4, text: "Turned a messy quarterly export into a report our whole team could actually read in minutes.", helpful: 14 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected for seeding");

  await Promise.all([
    User.deleteMany({}),
    Review.deleteMany({}),
    Tool.deleteMany({}),
    Submission.deleteMany({}),
  ]);

  const user = await User.create(demoUser);
  console.log(`Created demo user: ${user.email}`);

  await Tool.insertMany(tools);
  console.log(`Inserted ${tools.length} tools`);

  const reviews = reviewSeeds.map((r) => ({
    ...r,
    userId: user._id,
    toolName: tools.find((t) => t.slug === r.toolSlug)?.name || "",
    category: tools.find((t) => t.slug === r.toolSlug)?.category || "",
  }));
  await Review.insertMany(reviews);
  console.log(`Inserted ${reviews.length} reviews`);

  await mongoose.disconnect();
  console.log("Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

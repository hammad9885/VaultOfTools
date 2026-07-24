import { connectDB, isDBConnected } from "../app/lib/config/db.js";
import Tool from "../app/lib/models/Tool.js";
import Category from "../app/lib/models/Category.js";
import Tag from "../app/lib/models/Tag.js";
import {
  categories,
  categoryToolMap,
  popularTools,
  recentTools,
} from "../app/lib/data/categories.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Load .env.local
const envLocal = path.join(root, ".env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w._-]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveRating(upvotes: number) {
  return Math.min(5, Math.max(1, Math.round(((upvotes || 50) / 200) * 10) / 10));
}

async function migrate() {
  await connectDB();
  if (!isDBConnected()) {
    console.error("MongoDB not reachable at", process.env.MONGODB_URI || "mongodb://localhost:27017/vaultoftools");
    process.exit(1);
  }

  // ── Categories ──
  const allCatNames = new Set<string>();
  categories.forEach((c: any) => allCatNames.add(c.name));
  Object.keys(categoryToolMap).forEach((k) => allCatNames.add(k));
  allCatNames.add("AI Tools");
  allCatNames.add("Writing & Editing");
  allCatNames.add("Design & Creative");
  allCatNames.add("Technology & IT");
  allCatNames.add("Workflow Automation");
  allCatNames.add("Customer Service & Support");
  allCatNames.add("Growth & Marketing");

  const catDocs: Map<string, string> = new Map();
  for (const name of allCatNames) {
    const slug = slugify(name);
    const match = categories.find((c: any) => c.name === name);
    const doc = await Category.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name, slug, icon: match?.icon || null, description: `${name} tools and resources` } },
      { upsert: true, new: true }
    );
    catDocs.set(name, String(doc._id));
  }

  // ── Tags ──
  const allTags = new Set<string>();
  for (const t of Object.values(categoryToolMap).flat() as any[])
    (t.tags || []).forEach((tag: string) => allTags.add(tag));
  for (const t of [popularTools, recentTools].flat() as any[])
    (t.tags || []).forEach((tag: string) => allTags.add(tag));

  for (const name of allTags) {
    const slug = slugify(name);
    await Tag.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name, slug } },
      { upsert: true, new: true }
    );
  }

  // ── Tools ──
  async function upsertTool(t: any, catName: string, featured: boolean) {
    const slug = slugify(t.name);
    const catId = catDocs.get(catName) || null;
    await Tool.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          slug,
          name: t.name,
          shortDescription: (t.desc || "").substring(0, 200),
          fullDescription: t.desc || "",
          description: t.desc || "",
          category: catName,
          categoryId: catId,
          logo: t.logo || null,
          logoUrl: t.logo || null,
          imageUrl: t.logo || null,
          pricing: "Freemium",
          rating: deriveRating(t.upvotes),
          reviews: t.upvotes || 0,
          desc: t.desc || "",
          website: "",
          url: null,
          features: [],
          pros: [],
          cons: [],
          tags: t.tags || [],
          featured,
          featuredOrder: null,
          sponsored: false,
          sponsorName: null,
          sponsorStartDate: null,
          sponsorEndDate: null,
          sponsorPriority: null,
          sponsorActive: false,
          seoTitle: t.name,
          seoDescription: (t.desc || "").substring(0, 160),
          status: "published",
          publishDate: null,
        },
      },
      { upsert: true }
    );
  }

  for (const [catName, tools] of Object.entries(categoryToolMap)) {
    for (const t of tools as any[]) await upsertTool(t, catName, false);
  }
  for (const t of popularTools as any[]) await upsertTool(t, "AI Tools", true);
  for (const t of recentTools as any[]) await upsertTool(t, "AI Tools", false);

  const toolCount = await Tool.countDocuments();
  const catCount = await Category.countDocuments();
  const tagCount = await Tag.countDocuments();
  console.log(`MIGRATED: ${toolCount} tools, ${catCount} categories, ${tagCount} tags`);
  process.exit(0);
}

migrate().catch((e) => {
  console.error("MIGRATE_ERR:", e?.message || e);
  process.exit(1);
});

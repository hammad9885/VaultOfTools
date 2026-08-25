import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import User from "@/app/lib/models/User";
import Review from "@/app/lib/models/Review";
import Category from "@/app/lib/models/Category";
import Tag from "@/app/lib/models/Tag";
import BlogPost from "@/app/lib/models/BlogPost";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import Submission from "@/app/lib/models/Submission";
import Consultation from "@/app/lib/models/Consultation";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { getMergedSiteTools } from "@/app/lib/data/public-tools";
import { getMergedSitePosts } from "@/app/lib/data/site-posts";
import memoryStore from "@/app/lib/data/memoryStore";
import { categoryToolMap } from "@/app/lib/data/categories";
import { slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

function uniqueMemoryUsers() {
  const byId = new Map<string, any>();
  for (const user of memoryStore.users.values()) {
    if (user?._id) byId.set(String(user._id), user);
  }
  return [...byId.values()].map((u) => {
    const { password, ...rest } = u;
    return rest;
  });
}

async function catalogBackup() {
  const tools = await getMergedSiteTools({ publishedOnly: false });
  const posts = await getMergedSitePosts();
  const reviews = await memoryStore.getReviews({});
  const submissions = await memoryStore.getAllSubmissions({});
  const consultations = await memoryStore.getConsultations({});
  const subscribers = (memoryStore.subscribers || []).map((s: any, i: number) => ({
    _id: s._id || `mem-sub-${i}-${s.email}`,
    email: s.email,
    name: s.name || null,
    status: s.active === false ? "unsubscribed" : "subscribed",
    createdAt: s.createdAt,
  }));

  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  for (const tool of tools) {
    categoryCounts.set(tool.category, (categoryCounts.get(tool.category) || 0) + 1);
    for (const tag of tool.tags || []) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  for (const name of Object.keys(categoryToolMap)) {
    if (!categoryCounts.has(name)) categoryCounts.set(name, categoryToolMap[name]?.length || 0);
  }

  const categories = [...categoryCounts.entries()].map(([name, toolCount]) => ({
    _id: `site-cat-${slugify(name)}`,
    name,
    slug: slugify(name),
    toolCount,
  }));
  const tags = [...tagCounts.entries()].map(([name, toolCount]) => ({
    _id: `site-tag-${slugify(name)}`,
    name,
    slug: slugify(name),
    toolCount,
  }));

  return {
    tools,
    users: uniqueMemoryUsers(),
    reviews,
    categories,
    tags,
    posts,
    subscribers,
    submissions,
    consultations,
  };
}

async function safeFind(model: any, opts?: { select?: string }) {
  if (!isDBConnected()) return null;
  try {
    let q = model.find();
    if (opts?.select) q = q.select(opts.select);
    return await q.lean();
  } catch (err: any) {
    console.warn("backup collection failed:", err?.message || err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const fallback = await catalogBackup();

    if (!isDBConnected()) {
      const payload = {
        exportedAt: new Date().toISOString(),
        app: "VaultOfTools",
        dataSource: "site-catalog+memory",
        collections: fallback,
      };
      return new Response(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="vaultoftools-backup-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    const [tools, users, reviews, categories, tags, posts, subscribers, submissions, consultations] =
      await Promise.all([
        safeFind(Tool),
        safeFind(User, { select: "-password" }),
        safeFind(Review),
        safeFind(Category),
        safeFind(Tag),
        safeFind(BlogPost),
        safeFind(NewsletterSubscriber),
        safeFind(Submission),
        safeFind(Consultation),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      app: "VaultOfTools",
      dataSource: "database",
      collections: {
        tools: tools ?? fallback.tools,
        users: users ?? fallback.users,
        reviews: reviews ?? fallback.reviews,
        categories: categories ?? fallback.categories,
        tags: tags ?? fallback.tags,
        posts: posts ?? fallback.posts,
        subscribers: subscribers ?? fallback.subscribers,
        submissions: submissions ?? fallback.submissions,
        consultations: consultations ?? fallback.consultations,
      },
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="vaultoftools-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

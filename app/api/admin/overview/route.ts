import { connectDB, isDBConnected, withMongo } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import Review from "@/app/lib/models/Review";
import Category from "@/app/lib/models/Category";
import Tag from "@/app/lib/models/Tag";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import Submission from "@/app/lib/models/Submission";
import Consultation from "@/app/lib/models/Consultation";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { getActivities } from "@/app/lib/admin/activity";
import { getMergedSiteTools } from "@/app/lib/data/public-tools";
import { getMergedSitePosts } from "@/app/lib/data/site-posts";
import memoryStore from "@/app/lib/data/memoryStore";
import { categoryToolMap } from "@/app/lib/data/categories";

export const dynamic = "force-dynamic";

function uniqueMemoryUsers() {
  const byId = new Map<string, any>();
  for (const user of memoryStore.users.values()) {
    if (user?._id) byId.set(String(user._id), user);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

function siteCategoryCount() {
  return Math.max(Object.keys(categoryToolMap).length, 1);
}

export async function GET(request: Request) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const [siteTools, sitePosts] = await Promise.all([
      getMergedSiteTools({ publishedOnly: false }),
      getMergedSitePosts(),
    ]);

    const memoryUsers = uniqueMemoryUsers();
    const memoryReviews = await memoryStore.getReviews({});
    const memorySubs = memoryStore.subscribers || [];
    const memorySubmissions = await memoryStore.getAllSubmissions({});
    const memoryConsultations = await memoryStore.getConsultations({});

    // When Mongo is down, never touch Mongoose models — return catalog + memory only.
    const mongoUp = isDBConnected();

    const dbUsers = mongoUp
      ? await withMongo(() => User.countDocuments(), memoryUsers.length)
      : memoryUsers.length;
    const dbReviews = mongoUp
      ? await withMongo(() => Review.countDocuments(), memoryReviews.length)
      : memoryReviews.length;
    const dbCategories = mongoUp ? await withMongo(() => Category.countDocuments(), 0) : 0;
    const dbTags = mongoUp ? await withMongo(() => Tag.countDocuments(), 0) : 0;
    const dbSubscribers = mongoUp
      ? await withMongo(() => NewsletterSubscriber.countDocuments(), memorySubs.length)
      : memorySubs.length;
    const dbSubmissions = mongoUp
      ? await withMongo(() => Submission.countDocuments(), memorySubmissions.length)
      : memorySubmissions.length;
    const dbConsultations = mongoUp
      ? await withMongo(() => Consultation.countDocuments(), memoryConsultations.length)
      : memoryConsultations.length;
    const pendingReviews = mongoUp
      ? await withMongo(
          () => Review.countDocuments({ status: "pending" }),
          memoryReviews.filter((r: any) => r.status === "pending").length
        )
      : memoryReviews.filter((r: any) => r.status === "pending").length;
    const pendingSubmissions = mongoUp
      ? await withMongo(
          () => Submission.countDocuments({ status: "pending" }),
          memorySubmissions.filter((s: any) => s.status === "pending").length
        )
      : memorySubmissions.filter((s: any) => s.status === "pending").length;

    const recentUsers = mongoUp
      ? await withMongo(
          () =>
            User.find()
              .sort({ createdAt: -1 })
              .limit(8)
              .select("email displayName role status createdAt")
              .lean() as Promise<any[]>,
          () =>
            memoryUsers.slice(0, 8).map((u) => ({
              _id: u._id,
              email: u.email,
              displayName: u.displayName,
              role: u.role || "user",
              status: u.status || "active",
              createdAt: u.createdAt,
            }))
        )
      : memoryUsers.slice(0, 8).map((u) => ({
          _id: u._id,
          email: u.email,
          displayName: u.displayName,
          role: u.role || "user",
          status: u.status || "active",
          createdAt: u.createdAt,
        }));

    const recentReviews = mongoUp
      ? await withMongo(
          () =>
            Review.find()
              .sort({ createdAt: -1 })
              .limit(8)
              .select("toolName toolSlug userName rating text status createdAt")
              .lean() as Promise<any[]>,
          () =>
            memoryReviews.slice(0, 8).map((r: any) => ({
              _id: r._id,
              toolName: r.toolName,
              toolSlug: r.toolSlug,
              userName: r.userName || null,
              rating: r.rating,
              text: r.text,
              status: r.status || "approved",
              createdAt: r.createdAt,
            }))
        )
      : memoryReviews.slice(0, 8).map((r: any) => ({
          _id: r._id,
          toolName: r.toolName,
          toolSlug: r.toolSlug,
          userName: r.userName || null,
          rating: r.rating,
          text: r.text,
          status: r.status || "approved",
          createdAt: r.createdAt,
        }));

    const recentSubmissions = mongoUp
      ? await withMongo(
          () =>
            Submission.find()
              .sort({ createdAt: -1 })
              .limit(8)
              .select("name website category status createdAt")
              .lean() as Promise<any[]>,
          () =>
            memorySubmissions.slice(0, 8).map((s: any) => ({
              _id: s._id,
              name: s.name,
              website: s.website,
              category: s.category,
              status: s.status,
              createdAt: s.createdAt,
            }))
        )
      : memorySubmissions.slice(0, 8).map((s: any) => ({
          _id: s._id,
          name: s.name,
          website: s.website,
          category: s.category,
          status: s.status,
          createdAt: s.createdAt,
        }));

    const activity = await getActivities(12);

    const statusMap: Record<string, number> = { draft: 0, published: 0, archived: 0 };
    const pricingMap: Record<string, number> = { Free: 0, Freemium: 0, Paid: 0, Other: 0 };
    const categoryCounts = new Map<string, number>();
    const tagSet = new Set<string>();
    let featuredCount = 0;
    let sponsoredCount = 0;
    let totalViews = 0;
    let totalUpvotes = 0;
    let totalSaves = 0;
    let totalToolReviews = 0;

    for (const tool of siteTools) {
      const status = (tool.status || "published") as keyof typeof statusMap;
      if (status in statusMap) statusMap[status] += 1;
      else statusMap.published += 1;

      const pricing = String(tool.pricing || "Other");
      if (pricing in pricingMap) pricingMap[pricing] += 1;
      else pricingMap.Other += 1;

      categoryCounts.set(tool.category, (categoryCounts.get(tool.category) || 0) + 1);
      if (tool.featured) featuredCount += 1;
      if (tool.sponsored) sponsoredCount += 1;
      for (const tag of tool.tags || []) tagSet.add(tag);

      totalViews += Number(tool.clicks || 0);
      totalUpvotes += Number(tool.upvotes || 0);
      totalSaves += Number(tool.saves || 0);
      totalToolReviews += Number(tool.reviews || 0);
    }

    const categoryChart = [...categoryCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const pricingChart = Object.entries(pricingMap)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => ({ name, count }));

    const mapToolRow = (t: (typeof siteTools)[number]) => ({
      _id: t._id || t.slug,
      slug: t.slug,
      name: t.name,
      category: t.category,
      logo: t.logo,
      website: t.website,
      url: t.url,
      pricing: t.pricing,
      rating: t.rating,
      reviews: t.reviews,
      clicks: t.clicks,
      upvotes: t.upvotes,
      saves: t.saves,
      featured: Boolean(t.featured),
      sponsored: Boolean(t.sponsored),
      status: t.status || "published",
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.createdAt || new Date().toISOString(),
    });

    const recentTools = [...siteTools]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime() ||
          b.upvotes - a.upvotes
      )
      .slice(0, 8)
      .map(mapToolRow);

    const topViewedTools = [...siteTools]
      .sort((a, b) => b.clicks - a.clicks || b.upvotes - a.upvotes)
      .slice(0, 8)
      .map(mapToolRow);

    const topUpvotedTools = [...siteTools]
      .sort((a, b) => b.upvotes - a.upvotes || b.clicks - a.clicks)
      .slice(0, 8)
      .map(mapToolRow);

    const featuredPosts = sitePosts.filter((p) => p.featured).length;
    const recentPosts = sitePosts.slice(0, 10).map((p) => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      category: p.category,
      excerpt: p.excerpt,
      featured: p.featured,
      createdAt: p.createdAt || p.date || new Date().toISOString(),
      source: p.source,
    }));

    const categories = Math.max(dbCategories, categoryCounts.size, siteCategoryCount());
    const tags = Math.max(dbTags, tagSet.size);

    return Response.json({
      stats: {
        tools: siteTools.length,
        publishedTools: statusMap.published,
        users: dbUsers,
        reviews: dbReviews,
        toolReviewsListed: totalToolReviews,
        categories,
        tags,
        posts: sitePosts.length,
        featuredPosts,
        subscribers: dbSubscribers,
        submissions: dbSubmissions,
        consultations: dbConsultations,
        views: totalViews,
        upvotes: totalUpvotes,
        saves: totalSaves,
      },
      pending: { reviews: pendingReviews, submissions: pendingSubmissions },
      toolStatus: statusMap,
      featuredCount,
      sponsoredCount,
      categoryChart,
      pricingChart,
      recentTools,
      topViewedTools,
      topUpvotedTools,
      recentUsers,
      recentReviews,
      recentSubmissions,
      recentPosts,
      activity,
      dataSource: isDBConnected() ? "database" : "site-catalog+memory",
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

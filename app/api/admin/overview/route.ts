import { connectDB } from "@/app/lib/config/db";
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

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const [siteTools, sitePosts, users, reviews, dbCategories, tags, subscribers, submissions, consultations] =
      await Promise.all([
        getMergedSiteTools({ publishedOnly: false }),
        getMergedSitePosts(),
        User.countDocuments(),
        Review.countDocuments(),
        Category.countDocuments(),
        Tag.countDocuments(),
        NewsletterSubscriber.countDocuments(),
        Submission.countDocuments(),
        Consultation.countDocuments(),
      ]);

    const [pendingReviews, pendingSubmissions, recentUsers, recentReviews, recentSubmissions, activity] =
      await Promise.all([
        Review.countDocuments({ status: "pending" }),
        Submission.countDocuments({ status: "pending" }),
        User.find().sort({ createdAt: -1 }).limit(6).select("email displayName role status createdAt").lean(),
        Review.find().sort({ createdAt: -1 }).limit(6).select("toolName userName rating text status createdAt").lean(),
        Submission.find().sort({ createdAt: -1 }).limit(6).select("name website category status createdAt").lean(),
        getActivities(10),
      ]);

    const statusMap: Record<string, number> = { draft: 0, published: 0, archived: 0 };
    const categoryCounts = new Map<string, number>();
    const tagSet = new Set<string>();
    let featuredCount = 0;
    let sponsoredCount = 0;

    for (const tool of siteTools) {
      const status = (tool.status || "published") as keyof typeof statusMap;
      if (status in statusMap) statusMap[status] += 1;
      else statusMap.published += 1;
      categoryCounts.set(tool.category, (categoryCounts.get(tool.category) || 0) + 1);
      if (tool.featured) featuredCount += 1;
      if (tool.sponsored) sponsoredCount += 1;
      for (const tag of tool.tags || []) tagSet.add(tag);
    }

    const categoryChart = [...categoryCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const recentTools = [...siteTools]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime() ||
          b.upvotes - a.upvotes
      )
      .slice(0, 8)
      .map((t) => ({
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
        featured: Boolean(t.featured),
        sponsored: Boolean(t.sponsored),
        status: t.status || "published",
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.createdAt || new Date().toISOString(),
      }));

    const recentPosts = sitePosts.slice(0, 8);

    return Response.json({
      stats: {
        tools: siteTools.length,
        users,
        reviews,
        categories: Math.max(dbCategories, categoryCounts.size),
        tags: Math.max(tags, tagSet.size),
        posts: sitePosts.length,
        subscribers,
        submissions,
        consultations,
      },
      pending: { reviews: pendingReviews, submissions: pendingSubmissions },
      toolStatus: statusMap,
      featuredCount,
      sponsoredCount,
      categoryChart,
      recentTools,
      recentUsers,
      recentReviews,
      recentSubmissions,
      recentPosts,
      activity,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

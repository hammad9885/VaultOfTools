import { connectDB } from "@/app/lib/config/db";
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
import { getActivities } from "@/app/lib/admin/activity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const [tools, users, reviews, categories, tags, posts, subscribers, submissions, consultations] =
      await Promise.all([
        Tool.countDocuments(),
        User.countDocuments(),
        Review.countDocuments(),
        Category.countDocuments(),
        Tag.countDocuments(),
        BlogPost.countDocuments(),
        NewsletterSubscriber.countDocuments(),
        Submission.countDocuments(),
        Consultation.countDocuments(),
      ]);

    const [pendingReviews, pendingSubmissions, toolStatus, featuredCount, sponsoredCount, byCategory, recentTools, recentUsers, recentReviews, recentSubmissions, activity] =
      await Promise.all([
        Review.countDocuments({ status: "pending" }),
        Submission.countDocuments({ status: "pending" }),
        Tool.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Tool.countDocuments({ featured: true }),
        Tool.countDocuments({ sponsored: true }),
        Tool.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
        Tool.find().sort({ createdAt: -1 }).limit(6).select("slug name category pricing rating featured sponsored status createdAt").lean(),
        User.find().sort({ createdAt: -1 }).limit(6).select("email displayName role status createdAt").lean(),
        Review.find().sort({ createdAt: -1 }).limit(6).select("toolName userName rating text status createdAt").lean(),
        Submission.find().sort({ createdAt: -1 }).limit(6).select("name website category status createdAt").lean(),
        getActivities(10),
      ]);

    const statusMap: Record<string, number> = { draft: 0, published: 0, archived: 0 };
    for (const s of toolStatus) statusMap[s._id] = s.count;

    const categoryChart = byCategory.map((c) => ({ name: c._id, count: c.count }));

    return Response.json({
      stats: {
        tools, users, reviews, categories, tags, posts, subscribers, submissions, consultations,
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
      activity,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

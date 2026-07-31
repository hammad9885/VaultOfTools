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

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const [tools, users, reviews, categories, tags, posts, subscribers, submissions, consultations] =
      await Promise.all([
        Tool.find().lean(),
        User.find().select("-password").lean(),
        Review.find().lean(),
        Category.find().lean(),
        Tag.find().lean(),
        BlogPost.find().lean(),
        NewsletterSubscriber.find().lean(),
        Submission.find().lean(),
        Consultation.find().lean(),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      app: "VaultOfTools",
      collections: {
        tools, users, reviews, categories, tags, posts, subscribers, submissions, consultations,
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

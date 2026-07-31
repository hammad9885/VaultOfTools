import { connectDB } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import User from "@/app/lib/models/User";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import Review from "@/app/lib/models/Review";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { toCSV } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "tools";

    let csv = "";
    let filename = `${type}.csv`;

    if (type === "tools") {
      const tools = await Tool.find().sort({ createdAt: -1 }).lean();
      csv = toCSV(
        ["name", "slug", "category", "pricing", "rating", "reviews", "website", "url", "shortDescription", "description", "features", "tags", "featured", "sponsored", "status"],
        tools.map((t) => [
          t.name, t.slug, t.category, t.pricing, t.rating, t.reviews,
          t.website || "", t.url || "", t.shortDescription || "",
          t.description || t.fullDescription || "",
          (t.features || []).join(";"), (t.tags || []).join(";"),
          t.featured, t.sponsored, t.status,
        ])
      );
      filename = "tools.csv";
    } else if (type === "users") {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      csv = toCSV(
        ["email", "displayName", "role", "status", "createdAt"],
        users.map((u) => [u.email, u.displayName || u.name || "", u.role, u.status, new Date(u.createdAt).toISOString()])
      );
      filename = "users.csv";
    } else if (type === "subscribers") {
      const subs = await NewsletterSubscriber.find().sort({ createdAt: -1 }).lean();
      csv = toCSV(
        ["email", "name", "status", "createdAt"],
        subs.map((s) => [s.email, s.name || "", s.status, new Date(s.createdAt).toISOString()])
      );
      filename = "subscribers.csv";
    } else if (type === "reviews") {
      const reviews = await Review.find().sort({ createdAt: -1 }).lean();
      csv = toCSV(
        ["toolName", "toolSlug", "userName", "rating", "status", "text", "createdAt"],
        reviews.map((r) => [r.toolName, r.toolSlug, r.userName || "", r.rating, r.status, r.text, new Date(r.createdAt).toISOString()])
      );
      filename = "reviews.csv";
    } else {
      return Response.json({ error: "Unsupported export type" }, { status: 400 });
    }

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

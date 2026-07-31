import { connectDB } from "@/app/lib/config/db";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { clampPage } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["subscribed", "unsubscribed"].includes(status)) filter.status = status;

    const [total, items] = await Promise.all([
      NewsletterSubscriber.countDocuments(filter),
      NewsletterSubscriber.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    return Response.json({ items, total, page: clampPage(page, pages), pages });
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "A valid email is required" }, { status: 400 });
    }

    let subscriber = await NewsletterSubscriber.findOne({ email });
    if (subscriber) {
      if (subscriber.status === "unsubscribed") {
        subscriber.status = "subscribed";
        subscriber.active = true;
        await subscriber.save();
      }
      return Response.json(subscriber);
    }

    subscriber = await NewsletterSubscriber.create({ email, status: "subscribed", active: true });
    await logActivity(user.email, "created", `subscriber:${email}`, {});
    return Response.json(subscriber, { status: 201 });
  } catch (err: any) {
    return errorResponse(err);
  }
}

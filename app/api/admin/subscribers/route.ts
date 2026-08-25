import { connectDB, isDBConnected } from "@/app/lib/config/db";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { clampPage } from "@/app/lib/admin/utils";
import memoryStore from "@/app/lib/data/memoryStore";

export const dynamic = "force-dynamic";

function normalizeMemorySubscriber(s: any) {
  if (!s._id) s._id = `mem-sub-${String(s.email || "").toLowerCase()}`;
  return {
    _id: String(s._id),
    email: s.email,
    name: s.name || null,
    status: s.active === false || s.status === "unsubscribed" ? "unsubscribed" : "subscribed",
    active: s.active !== false && s.status !== "unsubscribed",
    createdAt: s.createdAt || new Date().toISOString(),
  };
}

function filterMemorySubscribers(opts: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  let list = (memoryStore.subscribers || [])
    .map(normalizeMemorySubscriber)
    .sort(
      (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

  if (opts.status === "subscribed") {
    list = list.filter((s) => s.status === "subscribed");
  }
  if (opts.status === "unsubscribed") {
    list = list.filter((s) => s.status === "unsubscribed");
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (s) =>
        String(s.email || "").toLowerCase().includes(q) ||
        String(s.name || "").toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / Math.max(1, opts.limit)));
  const safePage = clampPage(opts.page, pages);
  const items = list.slice((safePage - 1) * opts.limit, safePage * opts.limit);
  return { items, total, page: safePage, pages };
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const status = url.searchParams.get("status")?.trim() || undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    if (!isDBConnected()) {
      return Response.json(filterMemorySubscribers({ search, status, page, limit }));
    }

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["subscribed", "unsubscribed"].includes(status)) filter.status = status;

    try {
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
      console.warn("admin/subscribers Mongo failed, using memory:", err?.message || err);
      return Response.json(filterMemorySubscribers({ search, status, page, limit }));
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    if (!isDBConnected()) {
      let subscriber = await memoryStore.findSubscriber(email);
      if (!subscriber) subscriber = await memoryStore.addSubscriber(email);
      const normalized = normalizeMemorySubscriber(subscriber);
      await logActivity(user.email, "created", `subscriber:${email}`, {});
      return Response.json(normalized, { status: 201 });
    }

    try {
      let subscriber = await NewsletterSubscriber.findOne({ email });
      if (!subscriber) {
        subscriber = await NewsletterSubscriber.create({
          email,
          status: "subscribed",
          active: true,
        });
      }
      await logActivity(user.email, "created", `subscriber:${email}`, {});
      return Response.json(subscriber, { status: 201 });
    } catch (err: any) {
      console.warn("admin/subscribers create Mongo failed:", err?.message || err);
      let subscriber = await memoryStore.findSubscriber(email);
      if (!subscriber) subscriber = await memoryStore.addSubscriber(email);
      return Response.json(normalizeMemorySubscriber(subscriber), { status: 201 });
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

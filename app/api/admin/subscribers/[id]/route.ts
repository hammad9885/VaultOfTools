import { connectDB, isDBConnected } from "@/app/lib/config/db";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import memoryStore from "@/app/lib/data/memoryStore";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function isMemoryId(id: string) {
  return String(id).startsWith("mem-sub-") || String(id).startsWith("mem-");
}

function findMemorySubscriber(id: string) {
  const clean = String(id);
  return (memoryStore.subscribers || []).find((s: any) => {
    const email = String(s.email || "").toLowerCase();
    return (
      String(s._id) === clean ||
      email === clean.toLowerCase() ||
      clean === `mem-sub-${email}` ||
      clean === `mem-${email}`
    );
  });
}

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

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    if (!isDBConnected() || isMemoryId(id)) {
      const subscriber = findMemorySubscriber(id);
      if (!subscriber) return Response.json({ error: "Subscriber not found" }, { status: 404 });

      if (body.status !== undefined) {
        if (!["subscribed", "unsubscribed"].includes(body.status)) {
          return Response.json({ error: "Invalid status" }, { status: 400 });
        }
        subscriber.status = body.status;
        subscriber.active = body.status === "subscribed";
      }

      const normalized = normalizeMemorySubscriber(subscriber);
      await logActivity(user.email, "updated", `subscriber:${normalized.email}`, {
        status: normalized.status,
      });
      return Response.json(normalized);
    }

    try {
      const subscriber = await NewsletterSubscriber.findById(id);
      if (!subscriber) return Response.json({ error: "Subscriber not found" }, { status: 404 });

      if (body.status !== undefined) {
        if (!["subscribed", "unsubscribed"].includes(body.status)) {
          return Response.json({ error: "Invalid status" }, { status: 400 });
        }
        subscriber.status = body.status;
        subscriber.active = body.status === "subscribed";
      }

      await subscriber.save();
      await logActivity(user.email, "updated", `subscriber:${subscriber.email}`, {
        status: subscriber.status,
      });
      return Response.json(subscriber);
    } catch (err: any) {
      // Invalid ObjectId / buffering — try memory
      if (/ObjectId|CastError|buffer/i.test(String(err?.message || ""))) {
        const subscriber = findMemorySubscriber(id);
        if (!subscriber) return Response.json({ error: "Subscriber not found" }, { status: 404 });
        if (body.status !== undefined) {
          subscriber.status = body.status;
          subscriber.active = body.status === "subscribed";
        }
        return Response.json(normalizeMemorySubscriber(subscriber));
      }
      console.warn("admin/subscribers PATCH Mongo failed:", err?.message || err);
      return errorResponse(err);
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;

    if (!isDBConnected() || isMemoryId(id)) {
      const idx = (memoryStore.subscribers || []).findIndex((s: any) => {
        const email = String(s.email || "").toLowerCase();
        return (
          String(s._id) === String(id) ||
          String(id) === `mem-sub-${email}` ||
          String(id) === `mem-${email}`
        );
      });
      if (idx === -1) return Response.json({ error: "Subscriber not found" }, { status: 404 });
      const [subscriber] = memoryStore.subscribers.splice(idx, 1);
      await logActivity(user.email, "deleted", `subscriber:${subscriber.email}`, {});
      return Response.json({ message: "Subscriber removed" });
    }

    try {
      const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
      if (!subscriber) return Response.json({ error: "Subscriber not found" }, { status: 404 });
      await logActivity(user.email, "deleted", `subscriber:${subscriber.email}`, {});
      return Response.json({ message: "Subscriber removed" });
    } catch (err: any) {
      console.warn("admin/subscribers DELETE Mongo failed:", err?.message || err);
      if (/ObjectId|CastError|buffer/i.test(String(err?.message || ""))) {
        const idx = (memoryStore.subscribers || []).findIndex((s: any) => {
          const email = String(s.email || "").toLowerCase();
          return (
            String(s._id) === String(id) ||
            String(id) === `mem-sub-${email}` ||
            String(id) === `mem-${email}`
          );
        });
        if (idx === -1) return Response.json({ error: "Subscriber not found" }, { status: 404 });
        const [subscriber] = memoryStore.subscribers.splice(idx, 1);
        await logActivity(user.email, "deleted", `subscriber:${subscriber.email}`, {});
        return Response.json({ message: "Subscriber removed" });
      }
      return errorResponse(err);
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

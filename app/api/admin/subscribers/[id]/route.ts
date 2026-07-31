import { connectDB } from "@/app/lib/config/db";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const subscriber = await NewsletterSubscriber.findById(id);
    if (!subscriber) return Response.json({ error: "Subscriber not found" }, { status: 404 });

    const body = await request.json();
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
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    if (!subscriber) return Response.json({ error: "Subscriber not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `subscriber:${subscriber.email}`, {});
    return Response.json({ message: "Subscriber removed" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

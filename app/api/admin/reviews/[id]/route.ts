import { connectDB } from "@/app/lib/config/db";
import Review from "@/app/lib/models/Review";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const review = await Review.findById(id);
    if (!review) return Response.json({ error: "Review not found" }, { status: 404 });

    const body = await request.json();
    if (body.status !== undefined) {
      if (!["pending", "approved", "rejected"].includes(body.status)) {
        return Response.json({ error: "Invalid status" }, { status: 400 });
      }
      review.status = body.status;
    }
    if (body.rating !== undefined) {
      const r = Number(body.rating);
      if (r >= 1 && r <= 5) review.rating = r;
    }
    if (body.comment !== undefined) review.comment = body.comment || null;

    await review.save();

    if (review.status === "approved") {
      const approvedCount = await Review.countDocuments({ toolSlug: review.toolSlug, status: "approved" });
      const avg = await Review.aggregate([
        { $match: { toolSlug: review.toolSlug, status: "approved" } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]);
      await Tool.updateOne(
        { slug: review.toolSlug },
        {
          $set: {
            reviews: approvedCount,
            rating: Math.round((avg[0]?.avg || 0) * 10) / 10,
          },
        }
      );
    }

    await logActivity(user.email, "updated", `review:${review._id}`, { status: review.status });
    return Response.json(review);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return Response.json({ error: "Review not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `review:${review._id}`, { tool: review.toolName });
    return Response.json({ message: "Review deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

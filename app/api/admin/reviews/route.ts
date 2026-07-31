import { connectDB } from "@/app/lib/config/db";
import Review from "@/app/lib/models/Review";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { clampPage } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const rating = url.searchParams.get("rating")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { toolName: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { text: { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["pending", "approved", "rejected"].includes(status)) filter.status = status;
    if (rating) filter.rating = Number(rating);

    const [total, items] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
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

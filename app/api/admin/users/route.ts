import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { clampPage } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const role = url.searchParams.get("role")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;

    const [total, items] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password")
        .lean(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    return Response.json({ items, total, page: clampPage(page, pages), pages });
  } catch (err: any) {
    return errorResponse(err);
  }
}

import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { getActivities, countActivities } from "@/app/lib/admin/activity";
import { clampPage } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));

    let total = 0;
    let items: any[] = [];

    try {
      [total, items] = await Promise.all([
        countActivities(),
        getActivities(limit, (page - 1) * limit),
      ]);
    } catch (err: any) {
      console.warn("admin/activity failed, returning empty list:", err?.message || err);
      total = 0;
      items = [];
    }

    const pages = Math.max(1, Math.ceil(total / limit) || 1);
    return Response.json({
      items,
      total,
      page: clampPage(page, pages),
      pages,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

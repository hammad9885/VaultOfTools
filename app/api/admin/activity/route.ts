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

    const [total, items] = await Promise.all([
      countActivities(),
      getActivities(limit, (page - 1) * limit),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    return Response.json({ items, total, page: clampPage(page, pages), pages });
  } catch (err: any) {
    return errorResponse(err);
  }
}

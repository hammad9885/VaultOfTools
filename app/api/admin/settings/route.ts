import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { getSettings, updateSettings } from "@/app/lib/admin/settings";
import { logActivity } from "@/app/lib/admin/activity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const settings = await getSettings();
    return Response.json(settings);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    const body = await request.json();
    const allowed = ["general", "seo", "branding", "homepage", "smtp", "social", "analytics"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] && typeof body[key] === "object") patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No settings provided" }, { status: 400 });
    }
    const settings = await updateSettings(patch);
    await logActivity(user.email, "updated", "settings", { groups: Object.keys(patch) });
    return Response.json(settings);
  } catch (err: any) {
    return errorResponse(err);
  }
}

import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import Review from "@/app/lib/models/Review";
import Submission from "@/app/lib/models/Submission";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { alertNewAdmin, isPrivilegedRole } from "@/app/lib/alerts";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const ROLES = ["user", "admin", "moderator", "super_admin"];
const STATUSES = ["active", "suspended"];

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const target = await User.findById(id);
    if (!target) return Response.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const patch: Record<string, any> = {};
    const previousRole = String(target.role || "user");
    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) return Response.json({ error: "Invalid role" }, { status: 400 });
      patch.role = body.role;
    }
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
      patch.status = body.status;
    }
    if (body.displayName !== undefined) patch.displayName = String(body.displayName).trim();
    if (body.bio !== undefined) patch.bio = String(body.bio).trim();

    if (String(target._id) === String(user._id) && patch.status === "suspended") {
      return Response.json({ error: "You cannot suspend your own account" }, { status: 400 });
    }

    Object.assign(target, patch);
    await target.save();

    // Alert on role upgrade into an admin tier (promotion), not demotions.
    if (patch.role && patch.role !== previousRole && isPrivilegedRole(patch.role)) {
      void alertNewAdmin({
        email: target.email,
        role: patch.role,
        displayName: target.displayName || undefined,
        createdBy: user.email,
        event: "promoted",
        previousRole,
      }).catch(() => {});
    }

    await logActivity(user.email, "updated", `user:${target.email}`, { patch });
    return Response.json(target.toProfile());
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    if (String(id) === String(user._id)) {
      return Response.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const target = await User.findByIdAndDelete(id);
    if (!target) return Response.json({ error: "User not found" }, { status: 404 });

    await Promise.all([
      Review.deleteMany({ userId: target._id }),
      Submission.deleteMany({ userId: target._id }),
    ]);

    await logActivity(user.email, "deleted", `user:${target.email}`, {});
    return Response.json({ message: "User deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

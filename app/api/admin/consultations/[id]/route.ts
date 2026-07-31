import { connectDB } from "@/app/lib/config/db";
import Consultation from "@/app/lib/models/Consultation";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const STATUSES = ["new", "contacted", "qualified", "closed"];

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const consultation = await Consultation.findById(id);
    if (!consultation) return Response.json({ error: "Consultation not found" }, { status: 404 });

    const body = await request.json();
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return Response.json({ error: "Invalid status" }, { status: 400 });
      }
      consultation.status = body.status;
    }

    await consultation.save();
    await logActivity(user.email, "updated", `consultation:${consultation._id}`, {
      status: consultation.status,
    });
    return Response.json(consultation);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const consultation = await Consultation.findByIdAndDelete(id);
    if (!consultation) return Response.json({ error: "Consultation not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `consultation:${consultation._id}`, {
      name: consultation.name,
    });
    return Response.json({ message: "Consultation deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

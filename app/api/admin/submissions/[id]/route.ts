import { connectDB } from "@/app/lib/config/db";
import Submission from "@/app/lib/models/Submission";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const submission = await Submission.findById(id);
    if (!submission) return Response.json({ error: "Submission not found" }, { status: 404 });

    const body = await request.json();
    let publishedToCatalog = false;
    if (body.status !== undefined) {
      if (!["pending", "approved", "rejected"].includes(body.status)) {
        return Response.json({ error: "Invalid status" }, { status: 400 });
      }
      const prev = submission.status;
      submission.status = body.status;
      if (body.status === "approved" && prev !== "approved" && !body.withoutPublish) {
        const slug = slugify(submission.name);
        const existing = await Tool.findOne({ slug });
        if (!existing) {
          await Tool.create({
            slug,
            name: submission.name,
            category: submission.category || "Uncategorized",
            url: submission.website,
            website: submission.website,
            shortDescription: submission.description || "",
            description: submission.description || "",
            desc: submission.description || "",
            pricing: submission.pricing || "Free",
            status: "published",
            publishDate: new Date(),
          });
          publishedToCatalog = true;
        }
      }
    }

    await submission.save();
    await logActivity(user.email, "updated", `submission:${submission._id}`, {
      status: submission.status,
      publishedToCatalog,
    });
    return Response.json(submission);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const { id } = await params;
    const submission = await Submission.findByIdAndDelete(id);
    if (!submission) return Response.json({ error: "Submission not found" }, { status: 404 });

    await logActivity(user.email, "deleted", `submission:${submission._id}`, { name: submission.name });
    return Response.json({ message: "Submission deleted" });
  } catch (err: any) {
    return errorResponse(err);
  }
}

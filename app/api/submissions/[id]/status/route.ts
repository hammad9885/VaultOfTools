import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import Submission from "@/app/lib/models/Submission";
import Tool from "@/app/lib/models/Tool";
import { authenticate } from "@/app/lib/middleware/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { user } = await authenticate(request);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const submission = await Submission.findByIdAndUpdate(id, { status }, { new: true });
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (status === "approved") {
      const slug = submission.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const existing = await Tool.findOne({ slug });
      if (!existing) {
        await Tool.create({
          slug,
          name: submission.name,
          category: submission.category,
          pricing: submission.pricing || "Free",
          desc: submission.description,
          website: submission.website,
          tags: [submission.category.toLowerCase().replace(/\s+/g, "-")],
        });
      }
    }

    return NextResponse.json(submission);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}

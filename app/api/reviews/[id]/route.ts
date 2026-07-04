import { NextRequest, NextResponse } from "next/server";
import Review from "@/app/lib/models/Review";
import { authenticate } from "@/app/lib/middleware/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await authenticate(request);
    const { id } = await params;
    const review = await Review.findById(id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    if (review.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: "Review deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}

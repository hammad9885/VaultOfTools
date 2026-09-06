import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Review from "@/app/lib/models/Review";
import { authenticate } from "@/app/lib/middleware/auth";
import { hasAdminPrivilege } from "@/app/lib/admin/auth";
import memoryStore from "@/app/lib/data/memoryStore";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { user } = await authenticate(request);
    const { id } = await params;

    if (isDBConnected()) {
      const review = await Review.findById(id);
      if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

      if (review.userId.toString() !== user._id.toString() && !hasAdminPrivilege(user)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      await Review.findByIdAndDelete(id);
      return NextResponse.json({ message: "Review deleted" });
    }

    const result = await memoryStore.deleteReview(id, user._id, hasAdminPrivilege(user) ? "admin" : user.role);
    if (!result) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if ((result as any).unauthorized) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    return NextResponse.json({ message: "Review deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}

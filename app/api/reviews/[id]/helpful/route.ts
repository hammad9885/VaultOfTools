import { NextRequest, NextResponse } from "next/server";
import Review from "@/app/lib/models/Review";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const review = await Review.findByIdAndUpdate(id, { $inc: { helpful: 1 } }, { new: true });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    return NextResponse.json(review);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

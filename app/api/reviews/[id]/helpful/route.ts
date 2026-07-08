import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Review from "@/app/lib/models/Review";
import memoryStore from "@/app/lib/data/memoryStore";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;

    if (isDBConnected()) {
      const review = await Review.findByIdAndUpdate(id, { $inc: { helpful: 1 } }, { new: true });
      if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
      return NextResponse.json(review);
    }

    const review = await memoryStore.incrementHelpful(id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    return NextResponse.json(review);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

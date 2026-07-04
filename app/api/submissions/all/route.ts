import { NextRequest, NextResponse } from "next/server";
import Submission from "@/app/lib/models/Submission";
import { authenticate } from "@/app/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const filter: any = {};
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "displayName email");

    return NextResponse.json(submissions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}

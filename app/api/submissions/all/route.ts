import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Submission from "@/app/lib/models/Submission";
import { requireAdminOrSuperAdmin } from "@/app/lib/admin/auth";
import memoryStore from "@/app/lib/data/memoryStore";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { user } = await requireAdminOrSuperAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const filter: any = {};
    if (status) filter.status = status;

    if (isDBConnected()) {
      const submissions = await Submission.find(filter)
        .sort({ createdAt: -1 })
        .populate("userId", "displayName email");
      return NextResponse.json(submissions);
    }

    const submissions = await memoryStore.getAllSubmissions(filter);
    const withUser = await Promise.all(
      submissions.map(async (s: any) => {
        const u = await memoryStore.findUserById(s.userId);
        return { ...s, userId: u ? { _id: u._id, displayName: u.displayName, email: u.email } : s.userId };
      })
    );
    return NextResponse.json(withUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}

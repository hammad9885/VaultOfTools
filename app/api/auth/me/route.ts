import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    const profile = user.toProfile();
    return NextResponse.json({ user: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Not authenticated" }, { status: err.status || 401 });
  }
}

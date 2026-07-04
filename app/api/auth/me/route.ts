import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/lib/middleware/auth";
import { isDBConnected } from "@/app/lib/config/db";
import memoryStore from "@/app/lib/data/memoryStore";

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    const profile = isDBConnected() ? user.toProfile() : memoryStore.toProfile(user);
    return NextResponse.json({ user: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Not authenticated" }, { status: err.status || 401 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_EMAIL,
  getAdminPassword,
} from "@/app/lib/admin/credentials";
import {
  adminProfile,
  ensureAdminUser,
  signAdminToken,
} from "@/app/lib/admin/session";
import memoryStore from "@/app/lib/data/memoryStore";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, "admin_login", "auth", { max: 5, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalized = String(email).toLowerCase().trim();
    const adminPassword = getAdminPassword();

    if (!adminPassword || normalized !== ADMIN_EMAIL.toLowerCase() || String(password) !== adminPassword) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const user = await ensureAdminUser();
    const valid =
      typeof user.comparePassword === "function"
        ? await user.comparePassword(String(password))
        : await memoryStore.comparePassword(user, String(password));

    if (!valid) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const token = signAdminToken(user);
    return NextResponse.json({
      token,
      user: adminProfile(user),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Admin login failed" },
      { status: err.status || 500 }
    );
  }
}

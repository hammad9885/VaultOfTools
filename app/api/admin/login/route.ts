import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from "@/app/lib/admin/credentials";
import {
  adminProfile,
  ensureAdminUser,
  signAdminToken,
} from "@/app/lib/admin/session";
import memoryStore from "@/app/lib/data/memoryStore";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalized = String(email).toLowerCase().trim();
    if (normalized !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }
    if (String(password) !== ADMIN_PASSWORD) {
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

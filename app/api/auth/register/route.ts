import { NextRequest, NextResponse } from "next/server";
import {
  createAuthUser,
  findUserByEmail,
  signAuthToken,
  toAuthProfile,
} from "@/app/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const user = await createAuthUser({ email, password, displayName });
    const token = signAuthToken(user);
    return NextResponse.json({ token, user: toAuthProfile(user) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}

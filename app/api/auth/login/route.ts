import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  signAuthToken,
  toAuthProfile,
  verifyPassword,
} from "@/app/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 401 });
    }

    const valid = await verifyPassword(user, password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = signAuthToken(user);
    return NextResponse.json({ token, user: toAuthProfile(user) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthResponse,
  createAuthUser,
  findUserByEmail,
} from "@/app/lib/auth-server";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";
import { alertUserLogin, alertUserSignup } from "@/app/lib/alerts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit registrations to prevent spam bots (VOT-SEC-009)
    const rateCheck = checkRateLimit(ip, "auth_register", "auth", { max: 10, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password, displayName } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const safeDisplayName = displayName ? String(displayName).trim().slice(0, 100) : undefined;

    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    }

    const user = await createAuthUser({
      email: normalizedEmail,
      password: String(password),
      displayName: safeDisplayName,
    });

    await Promise.allSettled([
      alertUserSignup({
        email: user.email,
        displayName: user.displayName,
        provider: "Email & Password",
        role: user.role,
      }),
      alertUserLogin({
        email: user.email,
        displayName: user.displayName,
        provider: "Email & Password (Sign-Up)",
        role: user.role,
      }),
    ]);

    return NextResponse.json(buildAuthResponse(user), { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}

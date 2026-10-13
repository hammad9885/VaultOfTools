import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  signAuthToken,
  toAuthProfile,
  verifyPassword,
} from "@/app/lib/auth-server";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";
import { alertUserLogin } from "@/app/lib/alerts";

const GENERIC_AUTH_ERROR = "Invalid email or password.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit login attempts (VOT-SEC-009)
    const rateCheck = checkRateLimit(ip, "auth_login", "auth", { max: 10, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await findUserByEmail(String(email).trim().toLowerCase());
    if (!user) {
      // Uniform generic response to prevent user enumeration (VOT-SEC-023)
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const valid = await verifyPassword(user, String(password));
    if (!valid) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // Explicitly reject suspended accounts (VOT-SEC-006)
    if (user.status === "suspended" || user.status === "disabled") {
      return NextResponse.json(
        { error: "Your account is suspended. Please contact support." },
        { status: 403 }
      );
    }

    const token = signAuthToken(user);

    void alertUserLogin({
      email: user.email,
      displayName: user.displayName,
      provider: "Email & Password",
      role: user.role,
    }).catch(() => {});

    return NextResponse.json({ token, user: toAuthProfile(user) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

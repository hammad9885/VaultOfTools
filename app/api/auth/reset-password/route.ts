import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/app/lib/auth-server";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";
import {
  createPasswordResetToken,
  verifyAndConsumeResetToken,
} from "@/app/lib/auth-reset";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit password reset actions (VOT-SEC-009)
    const rateCheck = checkRateLimit(ip, "password_reset", "auth", { max: 10, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password, confirmPassword, token, action } = body;

    // Flow A: Request a reset token / email
    if (action === "request" || (!token && email && !password)) {
      const normalized = String(email || "").toLowerCase().trim();
      if (!normalized || !normalized.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }

      const user = await findUserByEmail(normalized);
      let resetToken: string | undefined;

      if (user) {
        resetToken = await createPasswordResetToken(normalized);
        // In production, an email would be dispatched via configured SMTP/SendGrid.
        // For development/test environments, token can be logged or returned in non-prod.
      }

      // Always return indistinguishable response to prevent email enumeration (VOT-SEC-023)
      return NextResponse.json({
        ok: true,
        message: "If an account exists with this email, password reset instructions have been sent.",
        ...(process.env.NODE_ENV !== "production" && resetToken ? { debugToken: resetToken } : {}),
      });
    }

    // Flow B: Confirm reset with token (VOT-SEC-001)
    if (!token) {
      // Direct reset without a valid token is rejected
      return NextResponse.json(
        { error: "Password reset token is required." },
        { status: 400 }
      );
    }

    const nextPassword = String(password || "");
    const confirm = String(confirmPassword || "");

    if (nextPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (nextPassword !== confirm) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const result = await verifyAndConsumeResetToken(token, nextPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Password has been successfully updated. You may now sign in.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

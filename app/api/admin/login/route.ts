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
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    const rateCheck = checkRateLimit(
      ip,
      "admin_login",
      "auth",
      {
        max: 5,
        windowMs: 60_000,
      }
    );

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many login attempts. Please wait and try again.",
        },
        { status: 429 }
      );
    }

    type LoginBody = {
  email?: unknown;
  password?: unknown;
};

let body: LoginBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const configuredEmail = ADMIN_EMAIL.toLowerCase().trim();
    const configuredPassword = getAdminPassword();

    if (!configuredPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin credentials are not configured.",
        },
        { status: 500 }
      );
    }

    if (email !== configuredEmail || password !== configuredPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin credentials.",
        },
        { status: 401 }
      );
    }

    const user = await ensureAdminUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to initialize admin account.",
        },
        { status: 500 }
      );
    }

    const token = signAdminToken(user);

    return NextResponse.json({
      success: true,
      token,
      user: adminProfile(user),
    });
  } catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Admin login failed.";
  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
      ? Number((err as { status: number }).status)
      : 500;

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
}
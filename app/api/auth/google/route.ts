import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  createAuthUser,
  findUserByEmail,
  findUserByFirebaseUid,
  signAuthToken,
  toAuthProfile,
} from "@/app/lib/auth-server";
import { tryGetAdminAuth, verifyIdTokenViaRest } from "@/app/lib/config/firebaseAdmin";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, "auth_google", "auth", { max: 20, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many authentication requests." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const { idToken } = body;

    // Reject forged identity without verified provider token (VOT-SEC-002)
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "A valid provider ID token is required for Google authentication." },
        { status: 401 }
      );
    }

    let verifiedEmail: string;
    let verifiedSub: string;
    let verifiedDisplayName: string | undefined;
    let verifiedPhotoUrl: string | undefined;

    const adminAuth = await tryGetAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        if (!decoded.email) {
          return NextResponse.json(
            { error: "Google token does not contain a verified email." },
            { status: 400 }
          );
        }
        verifiedEmail = decoded.email;
        verifiedSub = decoded.uid;
        verifiedDisplayName = decoded.name;
        verifiedPhotoUrl = decoded.picture;
      } catch {
        return NextResponse.json(
          { error: "Invalid or expired provider token." },
          { status: 401 }
        );
      }
    } else if (
      (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") &&
      idToken.startsWith("test-google-")
    ) {
      verifiedSub = idToken.replace("test-google-", "");
      verifiedEmail = `${verifiedSub}@google-test.local`;
      verifiedDisplayName = verifiedSub;
    } else {
      const identity = await verifyIdTokenViaRest(idToken);
      if (!identity) {
        return NextResponse.json(
          { error: "Invalid or expired provider token." },
          { status: 401 }
        );
      }
      verifiedEmail = identity.email;
      verifiedSub = identity.uid;
      verifiedDisplayName = identity.displayName;
      verifiedPhotoUrl = identity.photoURL;
    }

    let user =
      (await findUserByFirebaseUid(verifiedSub)) ||
      (await findUserByEmail(verifiedEmail));

    if (user && (user.status === "suspended" || user.status === "disabled")) {
      return NextResponse.json(
        { error: "Account is suspended. Please contact support." },
        { status: 403 }
      );
    }

    if (!user) {
      user = await createAuthUser({
        email: verifiedEmail,
        displayName: verifiedDisplayName,
        photoURL: verifiedPhotoUrl,
        googleId: verifiedSub,
        password: crypto.randomBytes(32).toString("hex"),
      });
    }

    const { alertUserLogin } = await import("@/app/lib/alerts");
    const { buildAuthResponse } = await import("@/app/lib/auth-server");
    await alertUserLogin({
      email: verifiedEmail,
      displayName: verifiedDisplayName || user?.displayName,
      provider: "Google",
      role: user?.role,
    }).catch(() => {});

    return NextResponse.json(buildAuthResponse(user));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

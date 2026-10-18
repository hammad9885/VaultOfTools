import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthResponse,
  findUserByEmail,
  upsertFirebaseUser,
} from "@/app/lib/auth-server";
import { tryGetAdminAuth, verifyIdTokenViaRest } from "@/app/lib/config/firebaseAdmin";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";
import { alertUserLogin } from "@/app/lib/alerts";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, "auth_firebase", "auth", { max: 20, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many authentication requests." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const { idToken } = body;

    // Reject unverified client-supplied identity without valid token (VOT-SEC-003)
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "A valid Firebase ID token is required for authentication." },
        { status: 401 }
      );
    }

    let verifiedEmail: string;
    let verifiedUid: string;
    let verifiedDisplayName: string | undefined;
    let verifiedPhotoUrl: string | undefined;

    const adminAuth = await tryGetAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        if (!decoded.email) {
          return NextResponse.json(
            { error: "Firebase token does not contain a verified email address." },
            { status: 400 }
          );
        }
        verifiedEmail = decoded.email;
        verifiedUid = decoded.uid;
        verifiedDisplayName = decoded.name;
        verifiedPhotoUrl = decoded.picture;
      } catch (err: any) {
        return NextResponse.json(
          { error: "Invalid or expired Firebase ID token." },
          { status: 401 }
        );
      }
    } else if (
      (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") &&
      idToken.startsWith("test-token-")
    ) {
      // Test tokens are only accepted in local dev/test
      verifiedUid = idToken.replace("test-token-", "");
      verifiedEmail = `${verifiedUid}@test.local`;
      verifiedDisplayName = verifiedUid;
    } else {
      // No service account configured: verify the token via Google's Identity Toolkit
      const identity = await verifyIdTokenViaRest(idToken);
      if (!identity) {
        return NextResponse.json(
          { error: "Invalid or expired Firebase ID token." },
          { status: 401 }
        );
      }
      verifiedEmail = identity.email;
      verifiedUid = identity.uid;
      verifiedDisplayName = identity.displayName;
      verifiedPhotoUrl = identity.photoURL;
    }

    // Check suspension prior to session creation
    const existing = await findUserByEmail(verifiedEmail);
    if (existing && (existing.status === "suspended" || existing.status === "disabled")) {
      return NextResponse.json(
        { error: "Account is suspended. Please contact support." },
        { status: 403 }
      );
    }

    const isNewUser = !existing;
    const finalDisplayName =
      verifiedDisplayName ||
      (body.displayName ? String(body.displayName).trim().slice(0, 100) : undefined);

    const user = await upsertFirebaseUser({
      email: verifiedEmail,
      displayName: finalDisplayName,
      photoURL: verifiedPhotoUrl || (body.photoURL ? String(body.photoURL).trim() : undefined),
      firebaseUid: verifiedUid,
    });

    const providerLabel = body.provider ? String(body.provider) : "Google/Firebase";

    if (isNewUser) {
      const { alertUserSignup } = await import("@/app/lib/alerts");
      await alertUserSignup({
        email: verifiedEmail,
        displayName: finalDisplayName || user?.displayName,
        provider: providerLabel,
        role: user?.role,
      }).catch(() => {});
    }

    await alertUserLogin({
      email: verifiedEmail,
      displayName: finalDisplayName || user?.displayName,
      provider: providerLabel,
      role: user?.role,
    }).catch(() => {});

    return NextResponse.json(buildAuthResponse(user));
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  createAuthUser,
  findUserByEmail,
  findUserByFirebaseUid,
  signAuthToken,
  toAuthProfile,
} from "@/app/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, photoURL, googleId } = await request.json();
    if (!email || !googleId) {
      return NextResponse.json({ error: "Email and googleId are required" }, { status: 400 });
    }

    let user =
      (await findUserByFirebaseUid(googleId)) ||
      (await findUserByEmail(email));

    if (!user) {
      user = await createAuthUser({
        email,
        displayName,
        photoURL,
        googleId,
        password: crypto.randomBytes(32).toString("hex"),
      });
    }

    const token = signAuthToken(user);
    return NextResponse.json({ token, user: toAuthProfile(user) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

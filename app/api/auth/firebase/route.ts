import { NextRequest, NextResponse } from "next/server";
import {
  signAuthToken,
  toAuthProfile,
  upsertFirebaseUser,
} from "@/app/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, photoURL, firebaseUid } = await request.json();

    if (!email || !firebaseUid) {
      return NextResponse.json(
        { error: "Email and firebaseUid are required" },
        { status: 400 }
      );
    }

    const user = await upsertFirebaseUser({
      email,
      displayName,
      photoURL,
      firebaseUid,
    });

    const token = signAuthToken(user);
    return NextResponse.json({ token, user: toAuthProfile(user) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

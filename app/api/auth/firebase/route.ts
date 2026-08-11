import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthResponse,
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

    return NextResponse.json(buildAuthResponse(user));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

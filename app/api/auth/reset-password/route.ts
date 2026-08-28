import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateAccountPassword } from "@/app/lib/auth-server";
import { tryGetAdminAuth } from "@/app/lib/config/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { email, password, confirmPassword } = await request.json();
    const normalized = String(email || "").toLowerCase().trim();
    const nextPassword = String(password || "");
    const confirm = String(confirmPassword || "");

    if (!normalized || !normalized.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (nextPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (nextPassword !== confirm) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    let firebaseUpdated = false;
    try {
      const adminAuth = await tryGetAdminAuth();
      if (adminAuth) {
        const fbUser = await adminAuth.getUserByEmail(normalized);
        await adminAuth.updateUser(fbUser.uid, { password: nextPassword });
        firebaseUpdated = true;
      }
    } catch (err: any) {
      if (err?.code !== "auth/user-not-found") {
        console.warn("Firebase password update failed:", err?.message || err);
      }
    }

    const localUser = await findUserByEmail(normalized);
    if (localUser) {
      await updateAccountPassword(normalized, nextPassword);
    }

    if (!localUser && !firebaseUpdated) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, firebaseUpdated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

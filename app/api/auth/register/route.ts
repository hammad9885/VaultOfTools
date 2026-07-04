import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { isDBConnected } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import memoryStore from "@/app/lib/data/memoryStore";

function signToken(user: any) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "default-secret",
    { expiresIn: "7d" }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    let user;
    if (isDBConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      user = await User.create({ email, password, displayName });
    } else {
      const existing = await memoryStore.findUserByEmail(email);
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      user = await memoryStore.createUser({ email, password, displayName });
    }

    const token = signToken(user);
    const profile = isDBConnected() ? user.toProfile() : memoryStore.toProfile(user);
    return NextResponse.json({ token, user: profile }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

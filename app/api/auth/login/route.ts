import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";

function signToken(user: any) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "default-secret",
    { expiresIn: "7d" }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    let user;
    if (isDBConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return NextResponse.json({ error: "No account found with this email" }, { status: 401 });
      const valid = await user.comparePassword(password);
      if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    } else {
      return NextResponse.json(
        { error: "Database unavailable — please try again in a few seconds" },
        { status: 503 }
      );
    }

    const token = signToken(user);
    const profile = user.toProfile();
    return NextResponse.json({ token, user: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

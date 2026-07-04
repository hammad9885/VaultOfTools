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
    const { email, displayName, photoURL, googleId } = await request.json();
    if (!email || !googleId) {
      return NextResponse.json({ error: "Email and googleId are required" }, { status: 400 });
    }

    let user;
    if (isDBConnected()) {
      user = await User.findOne({ googleId });
      if (!user) user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        if (!user.googleId) {
          user.googleId = googleId;
          if (photoURL) user.photoURL = photoURL;
          if (displayName && !user.displayName) user.displayName = displayName;
          await user.save();
        }
      } else {
        user = await User.create({
          email, displayName, photoURL, googleId,
          password: crypto.randomBytes(32).toString("hex"),
        });
      }
    } else {
      user = await memoryStore.findUserByGoogleId(googleId);
      if (!user) user = await memoryStore.findUserByEmail(email);
      if (!user) {
        user = await memoryStore.createUser({
          email, displayName, photoURL, googleId,
          password: crypto.randomBytes(32).toString("hex"),
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (photoURL) user.photoURL = photoURL;
        if (displayName && !user.displayName) user.displayName = displayName;
      }
    }

    const token = signToken(user);
    const profile = isDBConnected() ? user.toProfile() : memoryStore.toProfile(user);
    return NextResponse.json({ token, user: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

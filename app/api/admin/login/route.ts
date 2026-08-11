import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import { SUPER_ADMIN } from "@/app/lib/admin/types";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/app/lib/admin/credentials";

function signAdminToken(user: any) {
  return jwt.sign(
    { id: String(user._id), role: SUPER_ADMIN, scope: "admin" },
    process.env.JWT_SECRET || "default-secret",
    { expiresIn: "7d" }
  );
}

async function ensureAdminUser() {
  await connectDB();
  if (!isDBConnected()) {
    throw Object.assign(
      new Error("MongoDB is required for admin login. Start MongoDB and try again."),
      { status: 503 }
    );
  }

  const email = ADMIN_EMAIL.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      password: ADMIN_PASSWORD,
      displayName: "Super Admin",
      role: SUPER_ADMIN,
      status: "active",
    });
    return user;
  }

  let dirty = false;
  if (user.role !== SUPER_ADMIN) {
    user.role = SUPER_ADMIN;
    dirty = true;
  }
  const valid = await user.comparePassword(ADMIN_PASSWORD);
  if (!valid) {
    user.password = ADMIN_PASSWORD;
    dirty = true;
  }
  if (dirty) await user.save();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalized = String(email).toLowerCase().trim();
    if (normalized !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const user = await ensureAdminUser();
    const valid = await user.comparePassword(String(password));
    if (!valid) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const token = signAdminToken(user);
    const profile =
      typeof user.toProfile === "function"
        ? user.toProfile()
        : {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
          };

    return NextResponse.json({
      token,
      user: { ...profile, role: SUPER_ADMIN },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Admin login failed" },
      { status: err.status || 500 }
    );
  }
}

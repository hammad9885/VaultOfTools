import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import bcrypt from "bcryptjs";

const SETUP_KEY = process.env.SETUP_ADMIN_KEY || "10bd11412df495ec8f86085870fb004";

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-setup-key") || "";
  if (key !== SETUP_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const email = "mrhammadghg@gmail.com";
  const password = "Hammad@2121";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "super_admin";
    existing.status = "active";
    existing.password = password;
    await existing.save();
    return NextResponse.json({ message: "Admin updated", email: existing.email, role: existing.role });
  }

  const user = new User({
    email,
    password,
    displayName: "Hammad",
    role: "super_admin",
    status: "active",
  });
  await user.save();
  return NextResponse.json({ message: "Admin created", email: user.email, role: user.role });
}
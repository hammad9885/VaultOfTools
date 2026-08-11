import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import { SUPER_ADMIN } from "@/app/lib/admin/types";
import { ADMIN_EMAIL } from "@/app/lib/admin/credentials";

export async function GET(request: NextRequest) {
  try {
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret") as {
      id: string;
      role?: string;
      scope?: string;
    };

    if (decoded.scope !== "admin" && decoded.role !== SUPER_ADMIN) {
      return NextResponse.json({ error: "Admin token required" }, { status: 403 });
    }

    await connectDB();
    if (!isDBConnected()) {
      return NextResponse.json({ error: "MongoDB unavailable" }, { status: 503 });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.role !== SUPER_ADMIN) {
      return NextResponse.json({ error: "Admin not found" }, { status: 401 });
    }

    if (String(user.email).toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized admin account" }, { status: 403 });
    }

    const profile =
      typeof user.toProfile === "function"
        ? user.toProfile()
        : {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
          };

    return NextResponse.json({ user: { ...profile, role: SUPER_ADMIN } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Not authenticated" }, { status: 401 });
  }
}

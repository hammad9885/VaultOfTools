import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SUPER_ADMIN } from "@/app/lib/admin/types";
import {
  adminProfile,
  findAdminById,
  isConfiguredAdminEmail,
} from "@/app/lib/admin/session";

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

    const user = await findAdminById(decoded.id);
    if (!user || !isConfiguredAdminEmail(user.email)) {
      return NextResponse.json({ error: "Admin not found" }, { status: 401 });
    }

    // Normalize role even if memory/mongo drifted
    if (user.role !== SUPER_ADMIN) user.role = SUPER_ADMIN;

    return NextResponse.json({ user: adminProfile(user) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Not authenticated" }, { status: 401 });
  }
}

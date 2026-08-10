import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { findUserById, toAuthProfile } from "@/app/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const header = request.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret") as {
      id: string;
    };

    const user = await findUserById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({ user: toAuthProfile(user) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Not authenticated" },
      { status: 401 }
    );
  }
}

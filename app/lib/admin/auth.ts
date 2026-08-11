import jwt from "jsonwebtoken";
import { SUPER_ADMIN } from "./types";
import { findAdminById, isConfiguredAdminEmail } from "./session";

export async function requireSuperAdmin(request: Request): Promise<{ user: any }> {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw Object.assign(new Error("No token provided"), { status: 401 });
  }

  let decoded: { id: string; role?: string; scope?: string };
  try {
    decoded = jwt.verify(header.replace("Bearer ", ""), process.env.JWT_SECRET || "default-secret") as {
      id: string;
      role?: string;
      scope?: string;
    };
  } catch {
    throw Object.assign(new Error("Invalid or expired token"), { status: 401 });
  }

  if (decoded.scope !== "admin" && decoded.role !== SUPER_ADMIN) {
    throw Object.assign(new Error("Super admin access required"), { status: 403 });
  }

  const user = await findAdminById(decoded.id);
  if (!user || !isConfiguredAdminEmail(user.email)) {
    throw Object.assign(new Error("Unauthorized admin account"), { status: 403 });
  }

  user.role = SUPER_ADMIN;
  return { user };
}

export function isSuperAdmin(user: any): boolean {
  return (
    user?.role === SUPER_ADMIN &&
    isConfiguredAdminEmail(user?.email)
  );
}

export function errorResponse(err: any) {
  return Response.json(
    { error: err?.message || "Server error" },
    { status: err?.status || 500 }
  );
}

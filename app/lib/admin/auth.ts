import jwt from "jsonwebtoken";
import { SUPER_ADMIN } from "./types";
import { findAdminById, isConfiguredAdminEmail } from "./session";
import { getJwtSecret } from "../config/secrets";
import { authenticate } from "../middleware/auth";

export async function requireSuperAdmin(request: Request): Promise<{ user: any }> {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw Object.assign(new Error("No token provided"), { status: 401 });
  }

  let decoded: { id: string; role?: string; scope?: string };
  try {
    decoded = jwt.verify(header.replace("Bearer ", ""), getJwtSecret()) as {
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

/**
 * Checks if a user has admin or super_admin privileges (VOT-SEC-007).
 */
export function hasAdminPrivilege(user: any): boolean {
  if (!user) return false;
  return (
    user.role === SUPER_ADMIN ||
    user.role === "admin" ||
    isConfiguredAdminEmail(user.email)
  );
}

/**
 * Centralized authorization helper for all admin operations (VOT-SEC-007).
 */
export async function requireAdminOrSuperAdmin(request: Request): Promise<{ user: any }> {
  // First try admin bearer token
  try {
    const admin = await requireSuperAdmin(request);
    return admin;
  } catch {
    // If not admin token, check standard user auth token and role
    const { user } = await authenticate(request);
    if (!hasAdminPrivilege(user)) {
      throw Object.assign(new Error("Admin or Super Admin privilege required"), { status: 403 });
    }
    return { user };
  }
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

import { authenticate } from "../middleware/auth";
import { SUPER_ADMIN } from "./types";
import { ADMIN_EMAIL } from "./credentials";

export async function requireSuperAdmin(request: Request): Promise<{ user: any }> {
  const { user } = await authenticate(request);
  if (user?.role !== SUPER_ADMIN) {
    throw Object.assign(new Error("Super admin access required"), { status: 403 });
  }
  if (String(user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw Object.assign(new Error("Unauthorized admin account"), { status: 403 });
  }
  return { user };
}

export function isSuperAdmin(user: any): boolean {
  return (
    user?.role === SUPER_ADMIN &&
    String(user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export function errorResponse(err: any) {
  return Response.json(
    { error: err?.message || "Server error" },
    { status: err?.status || 500 }
  );
}

import jwt from "jsonwebtoken";
import { SUPER_ADMIN } from "./types";
import {
  findAdminById,
  isConfiguredAdminEmail,
} from "./session";
import { getJwtSecret } from "../config/secrets";

type AdminTokenPayload = {
  id: string;
  email?: string;
  role?: string;
  scope?: string;
};

type AdminRequestUser = {
  _id?: unknown;
  id?: unknown;
  email?: string;
  role?: string;
};

type AuthenticatedAdminUser = AdminRequestUser & {
  email: string;
  role: string;
};

export async function requireSuperAdmin(
  request: Request
): Promise<{ user: AuthenticatedAdminUser }> {
  const header = request.headers.get("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw Object.assign(
      new Error("No token provided"),
      { status: 401 }
    );
  }

  const token = header.slice(7).trim();

  if (!token) {
    throw Object.assign(
      new Error("No token provided"),
      { status: 401 }
    );
  }

  let decoded: AdminTokenPayload;

  try {
    decoded = jwt.verify(
      token,
      getJwtSecret()
    ) as AdminTokenPayload;
  } catch {
    throw Object.assign(
      new Error("Invalid or expired token"),
      { status: 401 }
    );
  }

  if (!decoded.id) {
    throw Object.assign(
      new Error("Invalid admin token"),
      { status: 401 }
    );
  }

  if (decoded.scope !== "admin") {
    throw Object.assign(
      new Error("Admin access required"),
      { status: 403 }
    );
  }

  if (decoded.role !== SUPER_ADMIN) {
    throw Object.assign(
      new Error("Super admin access required"),
      { status: 403 }
    );
  }

  const user = await findAdminById(decoded.id);

  if (!user) {
    throw Object.assign(
      new Error("Unauthorized admin account"),
      { status: 403 }
    );
  }

  if (!isConfiguredAdminEmail(user.email)) {
    throw Object.assign(
      new Error("Unauthorized admin account"),
      { status: 403 }
    );
  }

  user.role = SUPER_ADMIN;

  return {
    user: {
      ...user,
      email: user.email ?? "",
      role: SUPER_ADMIN,
    },
  };
}

export function hasAdminPrivilege(
  user: AdminRequestUser | null | undefined
): boolean {
  if (!user) {
    return false;
  }

  return (
    user.role === SUPER_ADMIN &&
    isConfiguredAdminEmail(user.email)
  );
}

export async function requireAdminOrSuperAdmin(
  request: Request
): Promise<{ user: AuthenticatedAdminUser }> {
  return requireSuperAdmin(request);
}

export function isSuperAdmin(
  user: AdminRequestUser | null | undefined
): boolean {
  return Boolean(
    user &&
      user.role === SUPER_ADMIN &&
      isConfiguredAdminEmail(user.email)
  );
}

export function errorResponse(error: unknown) {
  const err =
    error instanceof Error
      ? error
      : new Error("Server error");

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status: number }).status)
      : 500;

  return Response.json(
    {
      success: false,
      error: err.message,
    },
    {
      status,
    }
  );
}
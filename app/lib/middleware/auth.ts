import jwt from "jsonwebtoken";
import { findUserById } from "../auth-server";

import { getJwtSecret } from "../config/secrets";

export async function authenticate(request: Request): Promise<{ user: any }> {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw Object.assign(new Error("No token provided"), { status: 401 });
  }
  const token = header.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      id: string;
    };
    const user = await findUserById(decoded.id);
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 401 });
    }
    if (user.status === "suspended" || user.status === "disabled") {
      throw Object.assign(new Error("Account is suspended"), { status: 403 });
    }
    return { user };
  } catch (err: any) {
    if (err.status) throw err;
    throw Object.assign(new Error("Invalid or expired token"), { status: 401 });
  }
}

export async function optionalAuth(request: Request): Promise<{ user: any }> {
  try {
    return await authenticate(request);
  } catch {
    return { user: null };
  }
}

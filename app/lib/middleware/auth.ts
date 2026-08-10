import jwt from "jsonwebtoken";
import { connectDB, isDBConnected } from "../config/db";
import User from "../models/User";
import memoryStore from "../data/memoryStore";

async function findUser(id: string) {
  if (isDBConnected()) {
    return User.findById(id);
  }
  if (process.env.NODE_ENV === "production") {
    // On production the in-memory store is never populated; a missing
    // DB connection means the user simply cannot be resolved.
    throw Object.assign(new Error("Database unavailable — please try again"), { status: 503 });
  }
  return memoryStore.findUserById(id);
}

export async function authenticate(request: Request): Promise<{ user: any }> {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw Object.assign(new Error("No token provided"), { status: 401 });
  }
  const token = header.replace("Bearer ", "");
  try {
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret") as { id: string };
    const user = await findUser(decoded.id);
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 401 });
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

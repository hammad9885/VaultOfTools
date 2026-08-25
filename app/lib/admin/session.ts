import jwt from "jsonwebtoken";
import crypto from "crypto";
import { connectDB, isDBConnected } from "../config/db";
import User from "../models/User";
import memoryStore from "../data/memoryStore";
import { SUPER_ADMIN } from "./types";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./credentials";

export function signAdminToken(user: any) {
  return jwt.sign(
    { id: String(user._id), role: SUPER_ADMIN, scope: "admin" },
    process.env.JWT_SECRET || "default-secret",
    { expiresIn: "7d" }
  );
}

export function isConfiguredAdminEmail(email?: string | null) {
  return String(email || "").toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
}

/** Create/update the hard-coded admin in Mongo, or memory when Mongo is down. */
export async function ensureAdminUser() {
  await connectDB();
  const email = ADMIN_EMAIL.toLowerCase();

  if (isDBConnected()) {
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return await User.create({
          email,
          password: ADMIN_PASSWORD,
          displayName: "Super Admin",
          role: SUPER_ADMIN,
          status: "active",
        });
      }

      let dirty = false;
      if (user.role !== SUPER_ADMIN) {
        user.role = SUPER_ADMIN;
        dirty = true;
      }
      const valid = await user.comparePassword(ADMIN_PASSWORD);
      if (!valid) {
        user.password = ADMIN_PASSWORD;
        dirty = true;
      }
      if (dirty) await user.save();
      return user;
    } catch (err: any) {
      console.warn("ensureAdminUser Mongo failed, using memory:", err?.message);
    }
  }

  let user = await memoryStore.findUserByEmail(email);
  if (!user) {
    user = await memoryStore.createUser({
      email,
      password: ADMIN_PASSWORD,
      displayName: "Super Admin",
      role: SUPER_ADMIN,
    });
  } else {
    user.role = SUPER_ADMIN;
    user.displayName = user.displayName || "Super Admin";
    const ok = await memoryStore.comparePassword(user, ADMIN_PASSWORD);
    if (!ok) {
      user.password = await (await import("bcryptjs")).default.hash(ADMIN_PASSWORD, 12);
    }
  }
  return user;
}

/** Promote configured admin email to super_admin (Google / Firebase sync). */
export async function elevateConfiguredAdmin(user: any) {
  if (!user || !isConfiguredAdminEmail(user.email)) return user;

  if (typeof user.save === "function") {
    if (user.role !== SUPER_ADMIN) {
      user.role = SUPER_ADMIN;
      await user.save();
    }
    return user;
  }

  user.role = SUPER_ADMIN;
  return user;
}

export async function findAdminById(id: string) {
  await connectDB();
  if (isDBConnected()) {
    try {
      const user = await User.findById(id);
      if (user) return user;
    } catch (err: any) {
      console.warn("findAdminById Mongo failed, using memory:", err?.message);
    }
  }
  return memoryStore.findUserById(String(id));
}

export function adminProfile(user: any) {
  const base =
    typeof user?.toProfile === "function" ? user.toProfile() : memoryStore.toProfile(user);
  return { ...base, role: SUPER_ADMIN };
}

/** Stable random password when creating Google-linked admin shell user. */
export function randomPassword() {
  return crypto.randomBytes(32).toString("hex");
}

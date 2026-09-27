import jwt from "jsonwebtoken";
import crypto from "crypto";
import { connectDB, isDBConnected } from "../config/db";
import User from "../models/User";
import memoryStore from "../data/memoryStore";
import { SUPER_ADMIN } from "./types";
import { ADMIN_EMAIL, getAdminPassword } from "./credentials";
import { getJwtSecret } from "../config/secrets";

type AdminUser = {
  _id?: unknown;
  id?: unknown;
  email?: string;
  password?: string;
  displayName?: string;
  role?: string;
  status?: string;
  comparePassword?: (password: string) => Promise<boolean>;
  save?: () => Promise<unknown>;
  toProfile?: () => Record<string, unknown>;
};

export function signAdminToken(user: AdminUser) {
  return jwt.sign(
    {
      id: String(user._id ?? user.id ?? ""),
      email: ADMIN_EMAIL.toLowerCase(),
      role: SUPER_ADMIN,
      scope: "admin",
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );
}

export function isConfiguredAdminEmail(
  email?: string | null
): email is string {
  return (
    String(email || "")
      .trim()
      .toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export async function ensureAdminUser(): Promise<AdminUser> {
  await connectDB();

  const email = ADMIN_EMAIL.toLowerCase();
  const adminPassword = getAdminPassword();

  const effectivePassword =
    adminPassword || crypto.randomBytes(24).toString("hex");

  if (isDBConnected()) {
    try {
      let user = (await User.findOne({
        email,
      })) as AdminUser | null;

      if (!user) {
        user = (await User.create({
          email,
          password: effectivePassword,
          displayName: "Super Admin",
          role: SUPER_ADMIN,
          status: "active",
        })) as AdminUser;

        return user;
      }

      let dirty = false;

      if (!isConfiguredAdminEmail(user.email)) {
        user.email = email;
        dirty = true;
      }

      if (user.role !== SUPER_ADMIN) {
        user.role = SUPER_ADMIN;
        dirty = true;
      }

      if (user.status !== "active") {
        user.status = "active";
        dirty = true;
      }

      if (!user.displayName) {
        user.displayName = "Super Admin";
        dirty = true;
      }

      if (adminPassword && user.comparePassword) {
        const valid = await user.comparePassword(adminPassword);

        if (!valid) {
          user.password = adminPassword;
          dirty = true;
        }
      }

      if (dirty && user.save) {
        await user.save();
      }

      return user;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown database error";

      console.warn(
        "ensureAdminUser Mongo failed, using memory:",
        message
      );
    }
  }

  let user = (await memoryStore.findUserByEmail(
    email
  )) as AdminUser | null;

  if (!user) {
    user = (await memoryStore.createUser({
      email,
      password: effectivePassword,
      displayName: "Super Admin",
      role: SUPER_ADMIN,
    })) as AdminUser;

    return user;
  }

  user.email = email;
  user.role = SUPER_ADMIN;
  user.displayName = user.displayName || "Super Admin";
  user.status = "active";

  if (adminPassword) {
    const valid = await memoryStore.comparePassword(
      user,
      adminPassword
    );

    if (!valid) {
      const bcrypt = (await import("bcryptjs")).default;
      user.password = await bcrypt.hash(adminPassword, 12);
    }
  }

  return user;
}

export async function elevateConfiguredAdmin(
  user: AdminUser | null | undefined
) {
  if (!user || !isConfiguredAdminEmail(user.email)) {
    return user;
  }

  user.email = ADMIN_EMAIL.toLowerCase();
  user.role = SUPER_ADMIN;

  if (user.save) {
    await user.save();
  }

  return user;
}

export async function findAdminById(
  id: string
): Promise<AdminUser | null> {
  await connectDB();

  if (isDBConnected()) {
    try {
      const user = (await User.findById(id)) as AdminUser | null;

      if (user && isConfiguredAdminEmail(user.email)) {
        return user;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown database error";

      console.warn(
        "findAdminById Mongo failed, using memory:",
        message
      );
    }
  }

  const user = (await memoryStore.findUserById(
    String(id)
  )) as AdminUser | null;

  if (!user || !isConfiguredAdminEmail(user.email)) {
    return null;
  }

  return user;
}

export function adminProfile(user: AdminUser) {
  const base = user.toProfile
    ? user.toProfile()
    : memoryStore.toProfile(user);

  return {
    ...base,
    email: ADMIN_EMAIL.toLowerCase(),
    role: SUPER_ADMIN,
    displayName: user.displayName || "Super Admin",
  };
}

export function randomPassword() {
  return crypto.randomBytes(32).toString("hex");
}
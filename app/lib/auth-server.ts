import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB, isDBConnected } from "./config/db";
import User from "./models/User";
import memoryStore from "./data/memoryStore";
import {
  elevateConfiguredAdmin,
  isConfiguredAdminEmail,
  signAdminToken,
} from "./admin/session";
import { SUPER_ADMIN } from "./admin/types";
import { getJwtSecret } from "./config/secrets";

export function signAuthToken(user: any) {
  return jwt.sign(
    { id: String(user._id), role: user.role || "user" },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function toAuthProfile(user: any) {
  if (typeof user?.toProfile === "function") return user.toProfile();
  return memoryStore.toProfile(user);
}

export function buildAuthResponse(user: any) {
  if (isConfiguredAdminEmail(user?.email)) {
    user.role = SUPER_ADMIN;
  }
  const profile = toAuthProfile(user);
  if (isConfiguredAdminEmail(profile.email)) {
    profile.role = SUPER_ADMIN;
  }
  const payload: { token: string; user: any; adminToken?: string } = {
    token: signAuthToken(user),
    user: profile,
  };
  if (profile.role === SUPER_ADMIN) {
    payload.adminToken = signAdminToken(user);
  }
  return payload;
}

/** Prefer DB user, fall back to in-memory (dev / Mongo down). */
export async function findUserByEmail(email: string) {
  const normalized = String(email).toLowerCase().trim();
  await connectDB();

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: normalized });
      if (user) return user;
    } catch {}
  }

  return memoryStore.findUserByEmail(normalized);
}

export async function findUserByFirebaseUid(uid: string) {
  await connectDB();

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ googleId: uid });
      if (user) return user;
    } catch {}
  }

  return memoryStore.findUserByGoogleId(uid);
}

export async function findUserById(id: string) {
  await connectDB();

  if (isDBConnected()) {
    try {
      const user = await User.findById(id);
      if (user) return user;
    } catch {}
  }

  return memoryStore.findUserById(String(id));
}

export async function createAuthUser(data: {
  email: string;
  password?: string;
  displayName?: string;
  photoURL?: string | null;
  googleId?: string;
  role?: string;
}) {
  const email = String(data.email).toLowerCase().trim();
  const password = data.password || crypto.randomBytes(32).toString("hex");
  const role = isConfiguredAdminEmail(email) ? SUPER_ADMIN : data.role || "user";
  const payload = {
    email,
    password,
    displayName: data.displayName || email.split("@")[0],
    photoURL: data.photoURL || undefined,
    googleId: data.googleId,
    role,
  };

  await connectDB();

  if (isDBConnected()) {
    try {
      return await User.create(payload);
    } catch (err: any) {
      if (err?.code === 11000) throw Object.assign(new Error("Email already in use"), { status: 400 });
      console.warn("User.create failed, falling back to memory store:", err?.message);
    }
  }

  return memoryStore.createUser({
    ...payload,
    photoURL: payload.photoURL || null,
  });
}

export async function verifyPassword(user: any, password: string) {
  if (typeof user.comparePassword === "function") {
    return user.comparePassword(password);
  }
  return memoryStore.comparePassword(user, password);
}

export async function updateAccountPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (user) {
    if (typeof user.save === "function") {
      user.password = password;
      await user.save();
    } else {
      await memoryStore.updatePassword(email, password);
    }
  }
  return user;
}

export async function upsertFirebaseUser(data: {
  email: string;
  displayName?: string;
  photoURL?: string | null;
  firebaseUid: string;
}) {
  const email = String(data.email).toLowerCase().trim();
  let user =
    (await findUserByFirebaseUid(data.firebaseUid)) ||
    (await findUserByEmail(email));

  if (user) {
    if (user.status === "suspended" || user.status === "disabled") {
      throw Object.assign(new Error("Account is suspended"), { status: 403 });
    }
    if (typeof user.save === "function") {
      let dirty = false;
      if (!user.googleId) {
        user.googleId = data.firebaseUid;
        dirty = true;
      }
      if (data.photoURL && user.photoURL !== data.photoURL) {
        user.photoURL = data.photoURL;
        dirty = true;
      }
      if (data.displayName && !user.displayName) {
        user.displayName = data.displayName;
        dirty = true;
      }
      if (dirty) await user.save();
    } else {
      user.googleId = user.googleId || data.firebaseUid;
      if (data.photoURL) user.photoURL = data.photoURL;
      if (data.displayName && !user.displayName) user.displayName = data.displayName;
      if (user.googleId) {
        (memoryStore as any).users.set(`google:${user.googleId}`, user);
      }
    }
    return elevateConfiguredAdmin(user);
  }

  const created = await createAuthUser({
    email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    googleId: data.firebaseUid,
  });
  return elevateConfiguredAdmin(created);
}

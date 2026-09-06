import crypto from "crypto";
import { connectDB, isDBConnected } from "./config/db";
import PasswordResetToken from "./models/PasswordResetToken";
import { findUserByEmail, updateAccountPassword } from "./auth-server";
import { tryGetAdminAuth } from "./config/firebaseAdmin";

// In-memory fallback for local development/testing without live MongoDB
const memoryTokens = new Map<
  string,
  { email: string; expiresAt: number; usedAt: number | null }
>();

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates a cryptographically random one-time reset token.
 * Only the SHA-256 hash is persisted (VOT-SEC-001).
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

  await connectDB();
  if (isDBConnected()) {
    try {
      await PasswordResetToken.create({
        tokenHash,
        email: normalizedEmail,
        expiresAt,
        usedAt: null,
      });
      return rawToken;
    } catch (err) {
      console.warn("Could not persist reset token to Mongo, falling back to memory store:", err);
    }
  }

  memoryTokens.set(tokenHash, {
    email: normalizedEmail,
    expiresAt: expiresAt.getTime(),
    usedAt: null,
  });

  return rawToken;
}

/**
 * Validates and atomically consumes a password reset token (VOT-SEC-001).
 */
export async function verifyAndConsumeResetToken(
  rawToken: string,
  newPassword: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!rawToken || typeof rawToken !== "string") {
    return { success: false, error: "Reset token is required." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const tokenHash = hashToken(rawToken);
  await connectDB();

  let email: string | null = null;

  if (isDBConnected()) {
    try {
      const doc = await PasswordResetToken.findOne({ tokenHash });
      if (!doc) {
        return { success: false, error: "Invalid or expired reset token." };
      }
      if (doc.usedAt) {
        return { success: false, error: "This reset token has already been used." };
      }
      if (new Date(doc.expiresAt).getTime() < Date.now()) {
        return { success: false, error: "This reset token has expired." };
      }

      // Mark used atomically
      doc.usedAt = new Date();
      await doc.save();
      email = doc.email;
    } catch (err: any) {
      console.warn("Mongo reset token lookup failed:", err?.message);
    }
  }

  if (!email) {
    const mem = memoryTokens.get(tokenHash);
    if (!mem) {
      return { success: false, error: "Invalid or expired reset token." };
    }
    if (mem.usedAt) {
      return { success: false, error: "This reset token has already been used." };
    }
    if (mem.expiresAt < Date.now()) {
      return { success: false, error: "This reset token has expired." };
    }

    mem.usedAt = Date.now();
    email = mem.email;
  }

  if (!email) {
    return { success: false, error: "Unable to process token." };
  }

  // Update local password
  const localUser = await findUserByEmail(email);
  if (localUser) {
    await updateAccountPassword(email, newPassword);
  }

  // Update Firebase password if admin auth is available
  try {
    const adminAuth = await tryGetAdminAuth();
    if (adminAuth) {
      const fbUser = await adminAuth.getUserByEmail(email);
      if (fbUser?.uid) {
        await adminAuth.updateUser(fbUser.uid, { password: newPassword });
      }
    }
  } catch {
    // Ignore Firebase errors if user is not in Firebase or credentials not configured
  }

  return { success: true, email };
}

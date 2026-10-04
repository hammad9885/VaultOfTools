import crypto from "crypto";

let ephemeralDevSecret: string | null = null;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    if (secret === "default-secret") {
      throw new Error(
        "Security Violation (VOT-SEC-005): 'default-secret' is rejected. Set a strong JWT_SECRET."
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      secret.length < 32
    ) {
      throw new Error(
        "Security Violation (VOT-SEC-005): In production, JWT_SECRET must be at least 32 characters long."
      );
    }

    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Critical Security Error (VOT-SEC-005): JWT_SECRET environment variable is missing in production."
    );
  }

  if (!ephemeralDevSecret) {
    ephemeralDevSecret = crypto.randomBytes(32).toString("hex");
  }

  return ephemeralDevSecret;
}

export function getAdminCredentials() {
  const email = (
    process.env.ADMIN_EMAIL || "vaultoftools@gmail.com"
  )
    .toLowerCase()
    .trim();

  const password = process.env.ADMIN_PASSWORD || "";

  return {
    email,
    password,
  };
}
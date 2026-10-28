/**
 * Shared, environment-agnostic brand constants.
 * Safe to import from both server and client components.
 */

/** Single official email for support, admin, newsletter, and system alerts. */
export const OFFICIAL_EMAIL = "vaultoftools@gmail.com";

/** Public site origin used for SEO metadata, JSON-LD, and diagnostics. */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL || "https://vaultoftools.com";

/** Official social media profiles */
export const OFFICIAL_SOCIAL_LINKS = {
  twitter: "https://x.com/vaultoftools",
  youtube: "https://www.youtube.com/@VaultOfTools",
  facebook: "https://www.facebook.com/share/1Ecj2ytCKZ/",
  instagram: "https://www.instagram.com/vaultoftools?stkn=MWNxdzQ3NThudWZ5eA==",
} as const;

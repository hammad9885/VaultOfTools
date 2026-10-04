/**
 * Shared, environment-agnostic brand constants.
 * Safe to import from both server and client components.
 */

/** Single official email for support, admin, newsletter, and system alerts. */
export const OFFICIAL_EMAIL = "vaultoftools@gmail.com";

/** Public site origin used for SEO metadata, JSON-LD, and diagnostics. */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL || "https://vaultoftools.com";
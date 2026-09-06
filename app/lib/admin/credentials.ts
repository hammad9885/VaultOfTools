import { getAdminCredentials } from "../config/secrets";

/**
 * Admin credentials loaded safely from environment variables (VOT-SEC-004).
 */
export const ADMIN_EMAIL = getAdminCredentials().email;

export function getAdminPassword(): string {
  return getAdminCredentials().password;
}

import { getAdminCredentials } from "../config/secrets";

export const ADMIN_EMAIL = getAdminCredentials().email;

export function getAdminPassword(): string {
  return getAdminCredentials().password;
}
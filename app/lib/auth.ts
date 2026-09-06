import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
googleProvider.addScope("email");
googleProvider.addScope("profile");

async function syncAppSession(fbUser: User) {
  if (!fbUser.email) {
    throw new Error("Google account has no email. Use an account with email access.");
  }

  const googleProfile = fbUser.providerData.find(
    (provider) => provider.providerId === "google.com"
  );

  const idToken = await fbUser.getIdToken();
  const data = await api.firebaseAuth({
    idToken,
    email: fbUser.email,
    displayName: fbUser.displayName || undefined,
    photoURL: fbUser.photoURL || googleProfile?.photoURL || undefined,
    firebaseUid: fbUser.uid,
    provider: fbUser.providerData[0]?.providerId || "firebase",
  });

  api.setToken(data.token);
  if (data.adminToken) {
    api.setAdminToken(data.adminToken);
  } else {
    api.clearAdminToken();
  }

  return { ...data.user, adminToken: data.adminToken };
}

function shouldFallbackToRedirect(err: any) {
  const code = String(err?.code || "");
  const msg = String(err?.message || "");
  return (
    code === "auth/popup-blocked" ||
    code === "auth/operation-not-supported-in-this-environment" ||
    /cross-origin-opener|COOP|window\.closed|blocked/i.test(msg)
  );
}

export async function signInWithGoogle(): Promise<any> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return syncAppSession(result.user);
  } catch (err: any) {
    const code = String(err?.code || "");
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      throw err;
    }
    if (shouldFallbackToRedirect(err)) {
      await signInWithRedirect(auth, googleProvider);
      // Page will navigate away; keep the caller pending.
      return new Promise(() => {});
    }
    throw err;
  }
}

/** Finish Google redirect flow after returning to the app. */
export async function completeGoogleRedirectIfAny(): Promise<any | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    return syncAppSession(result.user);
  } catch (err) {
    console.warn("Google redirect completion failed:", err);
    return null;
  }
}

/** Public signup — Firebase Auth is source of truth */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<any> {
  const trimmed = email.trim();
  const result = await createUserWithEmailAndPassword(auth, trimmed, password);
  if (displayName) {
    try {
      await updateProfile(result.user, { displayName });
    } catch {}
  }
  return syncAppSession(result.user);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim();
  const continueUrl =
    typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
  await sendPasswordResetEmail(
    auth,
    trimmed,
    continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined
  );
}

export async function verifyResetCode(oobCode: string): Promise<string> {
  return verifyPasswordResetCode(auth, oobCode);
}

export async function confirmNewPassword(oobCode: string, newPassword: string): Promise<void> {
  await confirmPasswordReset(auth, oobCode, newPassword);
}

/** Public sign-in — Firebase Auth is source of truth */
export async function signInWithEmail(email: string, password: string): Promise<any> {
  const trimmed = email.trim();
  const result = await signInWithEmailAndPassword(auth, trimmed, password);
  return syncAppSession(result.user);
}

export async function signOut(): Promise<void> {
  api.clearToken();
  api.clearAdminToken();
  try {
    await firebaseSignOut(auth);
  } catch {}
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserRole(_uid: string): Promise<string> {
  return "user";
}

export { syncAppSession };

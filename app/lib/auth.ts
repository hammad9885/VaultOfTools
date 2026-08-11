import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

async function syncAppSession(fbUser: User) {
  const data = await api.firebaseAuth({
    email: fbUser.email!,
    displayName: fbUser.displayName || undefined,
    photoURL: fbUser.photoURL || undefined,
    firebaseUid: fbUser.uid,
    provider: fbUser.providerData[0]?.providerId || "firebase",
  });
  api.setToken(data.token);
  return data.user;
}

export async function signInWithGoogle(): Promise<any> {
  const result = await signInWithPopup(auth, googleProvider);
  return syncAppSession(result.user);
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

/** Public sign-in — Firebase Auth is source of truth */
export async function signInWithEmail(email: string, password: string): Promise<any> {
  const trimmed = email.trim();
  const result = await signInWithEmailAndPassword(auth, trimmed, password);
  return syncAppSession(result.user);
}

export async function signOut(): Promise<void> {
  api.clearToken();
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

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

/** Best-effort: mirror email user into Firebase (non-blocking for login UX). */
async function mirrorEmailToFirebase(email: string, password: string, displayName?: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      try {
        await updateProfile(result.user, { displayName });
      } catch {}
    }
  } catch {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      // Firebase Email provider may be disabled — app JWT session is enough.
    }
  }
}

export async function signInWithGoogle(): Promise<any> {
  const result = await signInWithPopup(auth, googleProvider);
  return syncAppSession(result.user);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<any> {
  const trimmed = email.trim();

  // Primary: app API (works even if Mongo is down / Firebase Email is off)
  const data = await api.register({ email: trimmed, password, displayName });
  api.setToken(data.token);

  // Secondary: keep Firebase in sync when available
  void mirrorEmailToFirebase(trimmed, password, displayName);

  return data.user;
}

export async function signInWithEmail(email: string, password: string): Promise<any> {
  const trimmed = email.trim();

  // Primary: app API
  const data = await api.login({ email: trimmed, password });
  api.setToken(data.token);

  // Secondary: Firebase session for Google-linked features
  void mirrorEmailToFirebase(trimmed, password);

  return data.user;
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

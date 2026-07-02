import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(): Promise<any> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const data = await api.googleAuth({
    email: fbUser.email!,
    displayName: fbUser.displayName || undefined,
    photoURL: fbUser.photoURL || undefined,
    googleId: fbUser.uid,
  });

  api.setToken(data.token);
  return data.user;
}

export async function signOut(): Promise<void> {
  api.clearToken();
  try { await firebaseSignOut(auth); } catch {}
}

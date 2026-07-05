import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
<<<<<<< HEAD
} from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";
=======
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
>>>>>>> 527336f (..)

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

<<<<<<< HEAD
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
=======
// ── Google Sign-In with Firestore user document upsert
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Upsert user document in Firestore
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: "user",            
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

// ── Sign-Out
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ── Auth State Observer 
export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ── Get user role from Firestore 
export async function getUserRole(uid: string): Promise<string> {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data().role ?? "user";
  return "user";
>>>>>>> 527336f (..)
}

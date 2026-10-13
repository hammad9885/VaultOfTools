import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

let firestoreDb: Firestore | null = null;

export async function tryGetAdminAuth(): Promise<Auth | null> {
  try {
    getFirestoreDb();
    const { getAuth } = await import("firebase-admin/auth");
    return getAuth();
  } catch {
    return null;
  }
}

export type VerifiedFirebaseIdentity = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
};

/**
 * Verifies a Firebase ID token without a service account by asking Google's
 * Identity Toolkit to look it up. Google rejects forged/expired tokens or
 * tokens issued for a different project.
 */
export async function verifyIdTokenViaRest(
  idToken: string
): Promise<VerifiedFirebaseIdentity | null> {
  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBH3u1UiPM89zWNUR96CG4ltXpBq92eq10";
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const account = data?.users?.[0];
    if (!account?.localId || !account?.email) return null;
    return {
      uid: account.localId,
      email: account.email,
      displayName: account.displayName || undefined,
      photoURL: account.photoUrl || undefined,
    };
  } catch {
    return null;
  }
}

export function getFirestoreDb(): Firestore {
  if (firestoreDb) return firestoreDb;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
  }

  let credential;
  try {
    credential = cert(JSON.parse(serviceAccount));
  } catch (err: any) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${err.message}`);
  }

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({ credential });

  firestoreDb = getFirestore(app);
  return firestoreDb;
}

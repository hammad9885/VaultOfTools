import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";

let firestoreDb: Firestore | null = null;

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

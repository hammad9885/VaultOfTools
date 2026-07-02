import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBH3u1UiPM89zWNUR96CG4ltXpBq92eq10",
  authDomain: "vault-of-tools.firebaseapp.com",
  projectId: "vault-of-tools",
  storageBucket: "vault-of-tools.firebasestorage.app",
  messagingSenderId: "386415319507",
  appId: "1:386415319507:web:2019acc3dc5915d48df726",
  measurementId: "G-9B9M7BGGTY",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

export const getAnalyticsInstance = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;

import mongoose from "mongoose";
import { isFirestore } from "./provider";

let dbConnected = false;
let connecting: Promise<void> | null = null;

export async function connectDB() {
  if (dbConnected || connecting) return;

  if (isFirestore()) {
    // Firestore is initialized lazily via firebaseAdmin.ts when a model
    // is first queried; there is no persistent connection to establish.
    dbConnected = true;
    return;
  }

  connecting = (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vaultoftools", {
        bufferCommands: false,
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      dbConnected = true;
    } catch (err: any) {
      console.warn("MongoDB unavailable — running without database:", err.message);
    }
  })();
  await connecting;
  connecting = null;
}

export function isDBConnected() {
  return dbConnected;
}

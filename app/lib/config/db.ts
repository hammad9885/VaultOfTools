import mongoose from "mongoose";
import { isFirestore } from "./provider";

let dbConnected = false;
let connecting: Promise<void> | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function connectDB() {
  if (dbConnected) return;
  if (connecting) return connecting;

  if (isFirestore()) {
    // Firestore is initialized lazily via firebaseAdmin.ts when a model
    // is first queried; there is no persistent connection to establish.
    dbConnected = true;
    return;
  }

  connecting = (async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vaultoftools", {
          bufferCommands: false,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
        });
        dbConnected = true;
        return;
      } catch (err: any) {
        if (attempt < 3) {
          console.warn(`MongoDB connect attempt ${attempt} failed, retrying:`, err.message);
          await sleep(1000 * attempt);
        } else {
          console.warn("MongoDB unavailable — running without database:", err.message);
        }
      }
    }
  })();
  await connecting;
  connecting = null;
}

export function isDBConnected() {
  return dbConnected;
}

import mongoose from "mongoose";
import { isFirestore } from "./provider";

let dbConnected = false;
let connecting: Promise<void> | null = null;
let gaveUp = false;

export async function connectDB() {
  if (dbConnected) return;
  if (gaveUp) return;
  if (connecting) return connecting;

  if (isFirestore()) {
    dbConnected = true;
    return;
  }

  connecting = (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vaultoftools", {
        bufferCommands: false,
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 1500,
      });
      dbConnected = true;
      gaveUp = false;
    } catch (err: any) {
      // Don't block auth — fall back to memory store immediately.
      gaveUp = true;
      console.warn("MongoDB unavailable — using in-memory auth fallback:", err.message);
      // Retry later in background (longer gap to avoid request latency spikes)
      setTimeout(() => {
        gaveUp = false;
      }, 60000);
    } finally {
      connecting = null;
    }
  })();

  await connecting;
}

export function isDBConnected() {
  return dbConnected;
}

import mongoose from "mongoose";

let dbConnected = false;
let connecting: Promise<void> | null = null;

export async function connectDB() {
  if (dbConnected || connecting) return;
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

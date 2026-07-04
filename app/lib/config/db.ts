import mongoose from "mongoose";

let dbConnected = false;

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vaultoftools", {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    dbConnected = true;
    console.log("MongoDB connected");
  } catch (err: any) {
    console.warn("MongoDB unavailable — running without database:", err.message);
  }
}

export function isDBConnected() {
  return dbConnected;
}

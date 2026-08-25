import mongoose from "mongoose";
import { isFirestore } from "./provider";

mongoose.set("bufferCommands", true);
// Fail fast instead of hanging admin pages for 10s when Mongo is unreachable.
mongoose.set("bufferTimeoutMS", 1500);

let dbConnected = false;
let connecting: Promise<void> | null = null;
let gaveUp = false;
let gaveUpAt = 0;

const GIVE_UP_MS = 60_000;

function mongoLive() {
  return mongoose.connection.readyState === 1;
}

function forceBufferingOn() {
  try {
    mongoose.set("bufferCommands", true);
    // Override any older connect({ bufferCommands: false }) left on this connection.
    (mongoose.connection as any).bufferCommands = true;
  } catch {
    // ignore
  }
}

function resolveFallback<T>(fallback: T | (() => T | Promise<T>)): Promise<T> {
  if (typeof fallback === "function") {
    return Promise.resolve((fallback as () => T | Promise<T>)());
  }
  return Promise.resolve(fallback);
}

export async function connectDB() {
  forceBufferingOn();

  if (isFirestore()) {
    dbConnected = true;
    return;
  }

  if (mongoLive()) {
    dbConnected = true;
    gaveUp = false;
    forceBufferingOn();
    return;
  }

  dbConnected = false;

  if (gaveUp && Date.now() - gaveUpAt < GIVE_UP_MS) return;

  if (connecting) return connecting;

  connecting = (async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        try {
          await mongoose.disconnect();
        } catch {
          // ignore
        }
      }

      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vaultoftools", {
        bufferCommands: true,
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 1500,
      });

      forceBufferingOn();

      if (!mongoLive()) {
        throw new Error("Mongo connected but readyState is not open");
      }

      dbConnected = true;
      gaveUp = false;
    } catch (err: any) {
      dbConnected = false;
      gaveUp = true;
      gaveUpAt = Date.now();
      forceBufferingOn();
      console.warn("MongoDB unavailable — using in-memory fallback:", err?.message || err);
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      } catch {
        // ignore
      }
    } finally {
      connecting = null;
    }
  })();

  await connecting;
}

export function isDBConnected() {
  if (isFirestore()) return dbConnected;
  const live = mongoLive();
  dbConnected = live;
  return live;
}

/** Run a Mongo operation only when the connection is open; otherwise use fallback. */
export async function withMongo<T>(
  fn: () => Promise<T>,
  fallback: T | (() => T | Promise<T>)
): Promise<T> {
  await connectDB();
  forceBufferingOn();
  if (!isDBConnected()) {
    return resolveFallback(fallback);
  }
  try {
    if (!mongoLive()) {
      dbConnected = false;
      return resolveFallback(fallback);
    }
    return await fn();
  } catch (err: any) {
    dbConnected = false;
    const message = String(err?.message || err || "");
    if (!/bufferCommands|initial connection/i.test(message)) {
      console.warn("Mongo operation failed — using fallback:", message);
    }
    return resolveFallback(fallback);
  }
}

export function isMongoObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(String(id || ""));
}

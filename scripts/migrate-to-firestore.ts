import mongoose from "mongoose";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────────────────────────
// Migrate local MongoDB data (mongodb://localhost:27017/vaultoftools)
// into Cloud Firestore (project vault-of-tools).
//
// Usage:
//   SET FIREBASE_SERVICE_ACCOUNT=<path-to-service-account.json>
//   npx tsx scripts/migrate-to-firestore.ts
// ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const envLocal = path.join(root, ".env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w._-]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const COLLECTIONS = [
  "tools",
  "users",
  "categories",
  "tags",
  "reviews",
  "blogposts",
  "newslettersubscribers",
  "submissions",
  "consultations",
  "activities",
  "settings",
];

function toPlain(value: any): any {
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (value instanceof mongoose.Types.Decimal128) return value.toString();
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = toPlain(v);
    }
    return out;
  }
  return value;
}

function clean(doc: any): any {
  const out = toPlain(doc);
  delete out.__v;
  return out;
}

async function run() {
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!keyPath) {
    console.error("Set FIREBASE_SERVICE_ACCOUNT to the service account JSON path first.");
    process.exit(1);
  }
  if (!fs.existsSync(keyPath)) {
    console.error("Service account file not found:", keyPath);
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/vaultoftools";
  console.log("Connecting to MongoDB:", mongoUri);
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  const mdb = mongoose.connection.db!;

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  for (const collName of COLLECTIONS) {
    const mongoColl = mdb.collection(collName);
    const docs = await mongoColl.find().toArray();
    if (docs.length === 0) {
      console.log(`${collName}: 0 docs (skipped)`);
      continue;
    }
    const fsRef = db.collection(collName);
    let written = 0;
    for (const raw of docs) {
      const doc = clean(raw);
      const id = String(raw._id);
      delete doc._id;
      await fsRef.doc(id).set(doc, { merge: true });
      written++;
    }
    console.log(`${collName}: ${written} docs migrated`);
  }

  const totals: Record<string, number> = {};
  for (const collName of COLLECTIONS) {
    const snap = await db.collection(collName).count().get();
    totals[collName] = snap.data().count || 0;
  }
  console.log("FIRESTORE TOTALS:", JSON.stringify(totals));
  process.exit(0);
}

run().catch((e) => {
  console.error("MIGRATE_ERR:", e?.message || e);
  process.exit(1);
});

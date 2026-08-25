import mongoose from "mongoose";
import { connectDB, isDBConnected } from "../config/db";
import { isFirestore } from "../config/provider";
import { createFirestoreModel } from "../firestore/model";

export interface IActivity extends mongoose.Document {
  actor: string;
  action: string;
  target: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

export type ActivityRecord = {
  _id: string;
  actor: string;
  action: string;
  target: string;
  meta?: Record<string, any>;
  createdAt: Date | string;
};

const activitySchema = new mongoose.Schema<IActivity>(
  {
    actor: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    target: { type: String, default: "", trim: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

const MongoActivity =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", activitySchema);
const FirestoreActivity = createFirestoreModel("activities");

const Activity = isFirestore() ? FirestoreActivity : MongoActivity;
export default Activity;

function memoryActivity(): ActivityRecord[] {
  const g = globalThis as any;
  if (!g.__votAdminActivity) g.__votAdminActivity = [] as ActivityRecord[];
  return g.__votAdminActivity as ActivityRecord[];
}

function pushMemory(actor: string, action: string, target = "", meta?: Record<string, any>) {
  const row: ActivityRecord = {
    _id: `mem-act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actor,
    action,
    target,
    meta: meta || {},
    createdAt: new Date(),
  };
  const list = memoryActivity();
  list.unshift(row);
  if (list.length > 500) list.length = 500;
  return row;
}

export async function logActivity(actor: string, action: string, target = "", meta?: Record<string, any>) {
  try {
    await connectDB();
    if (!isDBConnected()) {
      pushMemory(actor, action, target, meta);
      return;
    }
    try {
      await Activity.create({ actor, action, target, meta });
      // Mirror to memory so the activity page still works if Mongo drops later.
      pushMemory(actor, action, target, meta);
    } catch {
      pushMemory(actor, action, target, meta);
    }
  } catch {
    try {
      pushMemory(actor, action, target, meta);
    } catch {
      // ignore
    }
  }
}

export async function getActivities(limit = 50, skip = 0): Promise<ActivityRecord[]> {
  await connectDB();

  if (!isDBConnected()) {
    return memoryActivity().slice(skip, skip + limit);
  }

  try {
    const rows = await Activity.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const mapped = (rows as any[]).map((r) => ({
      _id: String(r._id),
      actor: r.actor,
      action: r.action,
      target: r.target || "",
      meta: r.meta,
      createdAt: r.createdAt,
    }));
    // Prefer DB rows; if empty, show any in-memory actions from this process.
    if (mapped.length > 0) return mapped;
    return memoryActivity().slice(skip, skip + limit);
  } catch (err: any) {
    console.warn("getActivities Mongo failed, using memory:", err?.message || err);
    return memoryActivity().slice(skip, skip + limit);
  }
}

export async function countActivities() {
  await connectDB();

  if (!isDBConnected()) {
    return memoryActivity().length;
  }

  try {
    const total = await Activity.countDocuments();
    return total > 0 ? total : memoryActivity().length;
  } catch (err: any) {
    console.warn("countActivities Mongo failed, using memory:", err?.message || err);
    return memoryActivity().length;
  }
}

export async function purgeActivitiesBefore(days: number) {
  await connectDB();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  if (!isDBConnected()) {
    const list = memoryActivity();
    const kept = list.filter((a) => new Date(a.createdAt).getTime() >= cutoff.getTime());
    list.length = 0;
    list.push(...kept);
    return { deletedCount: 0 };
  }

  try {
    return await Activity.deleteMany({ createdAt: { $lt: cutoff } });
  } catch (err: any) {
    console.warn("purgeActivitiesBefore Mongo failed:", err?.message || err);
    const list = memoryActivity();
    const kept = list.filter((a) => new Date(a.createdAt).getTime() >= cutoff.getTime());
    list.length = 0;
    list.push(...kept);
    return { deletedCount: 0 };
  }
}

export { connectDB, isDBConnected };

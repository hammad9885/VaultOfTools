import mongoose from "mongoose";
import { connectDB } from "../config/db";

export interface IActivity extends mongoose.Document {
  actor: string;
  action: string;
  target: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

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

const Activity =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", activitySchema);
export default Activity;

export async function logActivity(actor: string, action: string, target = "", meta?: Record<string, any>) {
  try {
    await connectDB();
    await Activity.create({ actor, action, target, meta });
  } catch {
    // Activity logging must never break admin actions.
  }
}

export async function getActivities(limit = 50, skip = 0) {
  await connectDB();
  return Activity.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
}

export async function countActivities() {
  await connectDB();
  return Activity.countDocuments();
}

export async function purgeActivitiesBefore(days: number) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return Activity.deleteMany({ createdAt: { $lt: cutoff } });
}

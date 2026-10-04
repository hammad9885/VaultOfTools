import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

export interface ISystemAlert {
  type: string;
  title: string;
  message: string;
  recipient: string;
  status: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const systemAlertSchema = new mongoose.Schema<ISystemAlert>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: String, required: true },
    status: { type: String, default: "delivered" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

systemAlertSchema.index({ createdAt: -1 });

const MongoSystemAlert =
  mongoose.models.SystemAlert ||
  mongoose.model<ISystemAlert>("SystemAlert", systemAlertSchema);
const FirestoreSystemAlert = createFirestoreModel("systemalerts");

const SystemAlert: AppModel = isFirestore()
  ? FirestoreSystemAlert
  : (MongoSystemAlert as unknown as AppModel);

export default SystemAlert;
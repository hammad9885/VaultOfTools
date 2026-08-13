import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

export interface ISavedTool {
  userId: mongoose.Types.ObjectId | string;
  slug: string;
  name: string;
  desc?: string;
  logo?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const savedToolSchema = new mongoose.Schema<ISavedTool>(
  {
    userId: { type: String, required: true, index: true },
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    desc: { type: String, trim: true },
    logo: { type: String, trim: true },
    category: { type: String, trim: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

savedToolSchema.index({ userId: 1, slug: 1 }, { unique: true });

const MongoSavedTool =
  mongoose.models.SavedTool || mongoose.model<ISavedTool>("SavedTool", savedToolSchema);
const FirestoreSavedTool = createFirestoreModel("savedTools");
const SavedTool: AppModel = isFirestore()
  ? FirestoreSavedTool
  : (MongoSavedTool as unknown as AppModel);
export default SavedTool;

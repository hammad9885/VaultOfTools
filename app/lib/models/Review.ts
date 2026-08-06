import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

export interface IReview {
  _id: mongoose.Types.ObjectId;
  toolSlug: string;
  toolId: string | null;
  toolName: string;
  category?: string;
  userId: mongoose.Types.ObjectId;
  userName: string | null;
  rating: number;
  text: string;
  comment: string | null;
  helpful: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    toolSlug: { type: String, required: true, trim: true, index: true },
    toolId: { type: String, default: null },
    toolName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    comment: { type: String, trim: true, default: null },
    helpful: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, toolSlug: 1 }, { unique: true });

const MongoReview = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
const FirestoreReview = createFirestoreModel("reviews");
const Review: AppModel = isFirestore() ? FirestoreReview : (MongoReview as unknown as AppModel);
export default Review;

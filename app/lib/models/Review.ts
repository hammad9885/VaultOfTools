import mongoose from "mongoose";

export interface IReview {
  _id: mongoose.Types.ObjectId;
  toolSlug: string;
  toolName: string;
  category?: string;
  userId: mongoose.Types.ObjectId;
  rating: number;
  text: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    toolSlug: { type: String, required: true, trim: true, index: true },
    toolName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, toolSlug: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
export default Review;

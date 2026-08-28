import mongoose from "mongoose";
import { isFirestore } from "../config/provider";

export interface IToolActivityDoc extends mongoose.Document {
  slug: string;
  /** UTC day key: "YYYY-MM-DD". */
  date: string;
  views: number;
  visits: number;
  votes: number;
  searches: number;
  ratings: number;
  ratingSum: number;
  updatedAt: Date;
}

const activitySchema = new mongoose.Schema<IToolActivityDoc>(
  {
    slug: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    views: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    searches: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
  },
  { timestamps: true }
);

activitySchema.index({ slug: 1, date: 1 }, { unique: true });

const MongoToolActivity =
  mongoose.models.ToolActivity ||
  mongoose.model<IToolActivityDoc>("ToolActivity", activitySchema);

// No Firestore equivalent: trending falls back to in-memory/lifetime counters there.
const ToolActivity = (isFirestore() ? null : MongoToolActivity) as any;

export default ToolActivity;
import mongoose from "mongoose";
import { isFirestore } from "../config/provider";

export interface IToolVoteDoc extends mongoose.Document {
  slug: string;
  voterId: string;
  createdAt: Date;
}

const voteSchema = new mongoose.Schema<IToolVoteDoc>(
  {
    slug: { type: String, required: true, trim: true },
    voterId: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

voteSchema.index({ slug: 1, voterId: 1 }, { unique: true });

const MongoToolVote = mongoose.models.ToolVote || mongoose.model<IToolVoteDoc>("ToolVote", voteSchema);

// No Firestore equivalent: duplicate prevention falls back to in-memory flags.
const ToolVote = (isFirestore() ? null : MongoToolVote) as any;

export default ToolVote;
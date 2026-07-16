import mongoose, { type Document } from "mongoose";

// Shared collection: "tags" (managed by AdminDashboard).
// Reading from the same collection guarantees tags created in the
// admin panel appear in VaultOfTools.
export interface ITag extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new mongoose.Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const Tag =
  mongoose.models.Tag || mongoose.model<ITag>("Tag", tagSchema);
export default Tag;

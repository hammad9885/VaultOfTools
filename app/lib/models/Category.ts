import mongoose, { type Document } from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

// Shared collection: "categories" (managed by AdminDashboard).
// Reading from the same collection guarantees categories created in the
// admin panel appear in VaultOfTools.
export interface ICategory extends Document {
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: null },
    description: { type: String, default: null },
  },
  { timestamps: true }
);

const MongoCategory =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
const FirestoreCategory = createFirestoreModel("categories");
const Category: AppModel = isFirestore() ? FirestoreCategory : (MongoCategory as unknown as AppModel);
export default Category;

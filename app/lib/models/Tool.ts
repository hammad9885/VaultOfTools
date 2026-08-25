import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

// Shared collection: "tools" (same collection written to by AdminDashboard).
// Fields below marked (shared) mirror the AdminDashboard Tool schema so that
// every change made in the admin panel is reflected here without duplication.
export interface ITool {
  slug: string;
  name: string;
  category: string;
  categoryId?: string | null;
  logo?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  url?: string | null;
  shortDescription?: string;
  fullDescription?: string;
  description?: string;
  desc?: string;
  pricing: string;
  rating: number;
  reviews: number;
  /** Page views / card opens — drives trending. */
  clicks: number;
  /** Community upvotes — drives trending. */
  upvotes: number;
  website?: string;
  features: string[];
  pros: string[];
  cons: string[];
  tags: string[];
  // AdminDashboard managed flags
  featured: boolean;
  featuredOrder?: number | null;
  sponsored: boolean;
  sponsorName?: string | null;
  sponsorStartDate?: Date | null;
  sponsorEndDate?: Date | null;
  sponsorPriority?: number | null;
  sponsorActive?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: "draft" | "published" | "archived";
  publishDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const toolSchema = new mongoose.Schema<ITool>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    categoryId: { type: String, default: null },
    logo: { type: String },
    logoUrl: { type: String, default: null },
    bannerUrl: { type: String, default: null },
    imageUrl: { type: String, default: null },
    url: { type: String, default: null },
    shortDescription: { type: String, trim: true, default: "" },
    fullDescription: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    desc: { type: String, trim: true },
    pricing: {
      type: String,
      enum: ["Free", "Freemium", "Paid", "free", "freemium", "paid", "subscription"],
      default: "Free",
    },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    website: { type: String, trim: true },
    features: [{ type: String, trim: true }],
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    // AdminDashboard managed flags
    featured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: null },
    sponsored: { type: Boolean, default: false },
    sponsorName: { type: String, default: null },
    sponsorStartDate: { type: Date, default: null },
    sponsorEndDate: { type: Date, default: null },
    sponsorPriority: { type: Number, default: null },
    sponsorActive: { type: Boolean, default: false },
    seoTitle: { type: String, default: null },
    seoDescription: { type: String, default: null },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published" },
    publishDate: { type: Date, default: null },
  },
  { timestamps: true }
);

toolSchema.index({ featured: 1 });
toolSchema.index({ sponsored: 1 });
toolSchema.index({ status: 1 });
toolSchema.index({ category: 1 });
toolSchema.index({ upvotes: -1, clicks: -1 });

const MongoTool = mongoose.models.Tool || mongoose.model<ITool>("Tool", toolSchema);
const FirestoreTool = createFirestoreModel("tools");
const Tool: AppModel = isFirestore() ? FirestoreTool : (MongoTool as unknown as AppModel);
export default Tool;

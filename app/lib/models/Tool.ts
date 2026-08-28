import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

// Shared collection: "tools" (same collection written to by AdminDashboard).
// Fields below marked (shared) mirror the AdminDashboard Tool schema so that
// every change made in the admin panel is reflected here without duplication.
export interface IToolCompareAttribute {
  label: string;
  value: string;
}

export interface IToolCompareData {
  overallRating?: number | null;
  easeOfUse?: number | null;
  featuresScore?: number | null;
  valueForMoney?: number | null;
  aiPowered?: boolean;
  apiAvailable?: boolean;
  teamCollaboration?: boolean;
  customerSupport?: string;
  platforms?: string[];
  integrations?: string[];
  attributes?: IToolCompareAttribute[];
}

export interface ITool {
  slug: string;
  name: string;
  category: string;
  categoryId?: string | null;
  subcategory?: string;
  toolType?: string;
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
  startingPrice?: string;
  billingPeriod?: string;
  freePlan?: boolean;
  freeTrial?: boolean;
  trialDuration?: string;
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
  bestFor?: string;
  useCases?: string[];
  tags: string[];
  searchKeywords?: string[];
  alternatives?: string[];
  videoUrl?: string;
  screenshots?: string[];
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
  ogImage?: string | null;
  status: "draft" | "published" | "archived";
  publishDate?: Date | null;
  compare?: IToolCompareData;
  createdAt: Date;
  updatedAt: Date;
}

const toolSchema = new mongoose.Schema<ITool>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    categoryId: { type: String, default: null },
    subcategory: { type: String, trim: true, default: "" },
    toolType: { type: String, trim: true, default: "" },
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
      enum: ["Free", "Freemium", "Paid", "Subscription", "free", "freemium", "paid", "subscription"],
      default: "Free",
    },
    startingPrice: { type: String, trim: true, default: "" },
    billingPeriod: { type: String, trim: true, default: "" },
    freePlan: { type: Boolean, default: false },
    freeTrial: { type: Boolean, default: false },
    trialDuration: { type: String, trim: true, default: "" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    website: { type: String, trim: true },
    features: [{ type: String, trim: true }],
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],
    bestFor: { type: String, trim: true, default: "" },
    useCases: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    searchKeywords: [{ type: String, trim: true }],
    alternatives: [{ type: String, trim: true }],
    videoUrl: { type: String, trim: true, default: "" },
    screenshots: [{ type: String, trim: true }],
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
    ogImage: { type: String, default: null },
    status: { type: String, enum: ["draft", "published", "archived"], default: "published" },
    publishDate: { type: Date, default: null },
    compare: {
      type: {
        overallRating: { type: Number, default: null },
        easeOfUse: { type: Number, default: null },
        featuresScore: { type: Number, default: null },
        valueForMoney: { type: Number, default: null },
        aiPowered: { type: Boolean, default: false },
        apiAvailable: { type: Boolean, default: false },
        teamCollaboration: { type: Boolean, default: false },
        customerSupport: { type: String, trim: true, default: "" },
        platforms: [{ type: String, trim: true }],
        integrations: [{ type: String, trim: true }],
        attributes: [
          {
            _id: false,
            label: { type: String, trim: true, default: "" },
            value: { type: String, trim: true, default: "" },
          },
        ],
      },
      default: undefined,
    },
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

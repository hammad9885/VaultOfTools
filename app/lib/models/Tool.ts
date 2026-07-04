import mongoose from "mongoose";

export interface ITool {
  slug: string;
  name: string;
  category: string;
  logo?: string;
  pricing: "Free" | "Freemium" | "Paid";
  rating: number;
  reviews: number;
  desc?: string;
  website?: string;
  features: string[];
  pros: string[];
  cons: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const toolSchema = new mongoose.Schema<ITool>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    logo: { type: String },
    pricing: { type: String, enum: ["Free", "Freemium", "Paid"], default: "Free" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    desc: { type: String, trim: true },
    website: { type: String, trim: true },
    features: [{ type: String, trim: true }],
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const Tool = mongoose.models.Tool || mongoose.model<ITool>("Tool", toolSchema);
export default Tool;

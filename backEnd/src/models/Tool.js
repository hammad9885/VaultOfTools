const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Tool", toolSchema);

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Review", reviewSchema);

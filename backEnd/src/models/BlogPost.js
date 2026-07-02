const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    coverImage: { type: String },
    date: { type: String },
    readTime: { type: String },
    featured: { type: Boolean, default: false },
    author: {
      name: { type: String },
      avatar: { type: String },
      role: { type: String },
      bio: { type: String },
    },
    content: [
      {
        type: { type: String, enum: ["paragraph", "heading", "quote", "image", "list"] },
        text: { type: String },
        cite: { type: String },
        src: { type: String },
        alt: { type: String },
        caption: { type: String },
        items: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlogPost", blogPostSchema);

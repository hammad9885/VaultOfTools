import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

interface IContentBlock {
  type: "paragraph" | "heading" | "quote" | "image" | "list";
  text?: string;
  cite?: string;
  src?: string;
  alt?: string;
  caption?: string;
  items?: string[];
}

export interface IBlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  coverImage?: string;
  date?: string;
  readTime?: string;
  featured: boolean;
  author?: {
    name?: string;
    avatar?: string;
    role?: string;
    bio?: string;
  };
  content: IContentBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new mongoose.Schema<IBlogPost>(
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

const MongoBlogPost = mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", blogPostSchema);
const FirestoreBlogPost = createFirestoreModel("blogposts");
const BlogPost: AppModel = isFirestore() ? FirestoreBlogPost : (MongoBlogPost as unknown as AppModel);
export default BlogPost;

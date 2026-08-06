import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

// Shared collection: "newslettersubscribers" (same collection used by AdminDashboard).
export interface INewsletterSubscriber {
  email: string;
  name?: string | null;
  active: boolean;
  status: "subscribed" | "unsubscribed";
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new mongoose.Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, default: null },
    active: { type: Boolean, default: true },
    status: { type: String, enum: ["subscribed", "unsubscribed"], default: "subscribed" },
  },
  { timestamps: true }
);

const MongoSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", subscriberSchema);
const FirestoreSubscriber = createFirestoreModel("newslettersubscribers");
const NewsletterSubscriber: AppModel = isFirestore()
  ? FirestoreSubscriber
  : (MongoSubscriber as unknown as AppModel);
export default NewsletterSubscriber;

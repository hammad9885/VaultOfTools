import mongoose from "mongoose";

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

const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", subscriberSchema);
export default NewsletterSubscriber;

import mongoose from "mongoose";

export interface INewsletterSubscriber {
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new mongoose.Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", subscriberSchema);
export default NewsletterSubscriber;

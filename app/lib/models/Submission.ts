import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

export interface ISubmission {
  userId: mongoose.Types.ObjectId;
  name: string;
  website: string;
  category: string;
  description?: string;
  pricing?: string;
  founderName?: string;
  companyName?: string;
  launchYear?: string;
  email?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new mongoose.Schema<ISubmission>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    pricing: { type: String, trim: true },
    founderName: { type: String, trim: true },
    companyName: { type: String, trim: true },
    launchYear: { type: String, trim: true },
    email: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const MongoSubmission = mongoose.models.Submission || mongoose.model<ISubmission>("Submission", submissionSchema);
const FirestoreSubmission = createFirestoreModel("submissions");
const Submission: AppModel = isFirestore() ? FirestoreSubmission : (MongoSubmission as unknown as AppModel);
export default Submission;

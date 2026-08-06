import mongoose from "mongoose";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

export interface IConsultation {
  name: string;
  email: string;
  company?: string;
  message: string;
  status: "new" | "contacted" | "qualified" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new mongoose.Schema<IConsultation>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

const MongoConsultation = mongoose.models.Consultation || mongoose.model<IConsultation>("Consultation", consultationSchema);
const FirestoreConsultation = createFirestoreModel("consultations");
const Consultation: AppModel = isFirestore() ? FirestoreConsultation : (MongoConsultation as unknown as AppModel);
export default Consultation;

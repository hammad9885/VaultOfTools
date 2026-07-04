import mongoose from "mongoose";

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

const Consultation = mongoose.models.Consultation || mongoose.model<IConsultation>("Consultation", consultationSchema);
export default Consultation;

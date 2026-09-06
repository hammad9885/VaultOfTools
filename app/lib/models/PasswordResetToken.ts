import mongoose from "mongoose";

export interface IPasswordResetTokenDoc extends mongoose.Document {
  tokenHash: string;
  email: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

const resetTokenSchema = new mongoose.Schema<IPasswordResetTokenDoc>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: "24h" } },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const PasswordResetToken =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetTokenDoc>("PasswordResetToken", resetTokenSchema);

export default PasswordResetToken;

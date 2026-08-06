import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { isFirestore } from "../config/provider";
import { createFirestoreModel, type AppModel } from "../firestore/model";

export interface IUser {
  _id: mongoose.Types.ObjectId | string;
  email: string;
  password: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  company?: string;
  role: "user" | "admin" | "moderator" | "super_admin";
  status: "active" | "suspended";
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
  toProfile(): Record<string, any>;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    displayName: { type: String, trim: true, maxlength: 80 },
    name: { type: String, trim: true, maxlength: 80 },
    photoURL: { type: String },
    avatarUrl: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 500 },
    website: { type: String, trim: true, maxlength: 200 },
    location: { type: String, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100 },
    role: { type: String, enum: ["user", "admin", "moderator", "super_admin"], default: "user" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    googleId: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toProfile = function () {
  return {
    id: this._id,
    email: this.email,
    displayName: this.displayName || this.email.split("@")[0],
    photoURL: this.photoURL,
    bio: this.bio,
    website: this.website || null,
    location: this.location || null,
    company: this.company || null,
    role: this.role,
    status: this.status,
  };
};

const MongoUser = mongoose.models.User || mongoose.model<IUser, UserModel>("User", userSchema);

const FirestoreUser = createFirestoreModel("users", {
  preSave: async (data: any) => {
    if (data.password && !data.password.startsWith("$2")) {
      data.password = await bcrypt.hash(data.password, 12);
    }
  },
  methods: {
    async comparePassword(this: any, candidate: string) {
      return bcrypt.compare(candidate, this.password);
    },
    toProfile(this: any) {
      return {
        id: this._id,
        email: this.email,
        displayName: this.displayName || this.email.split("@")[0],
        photoURL: this.photoURL,
        bio: this.bio,
        website: this.website || null,
        location: this.location || null,
        company: this.company || null,
        role: this.role,
        status: this.status,
      };
    },
  },
});

const User: AppModel = isFirestore() ? FirestoreUser : (MongoUser as unknown as AppModel);
export default User;

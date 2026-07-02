const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    displayName: { type: String, trim: true, maxlength: 80 },
    photoURL: { type: String },
    bio: { type: String, trim: true, maxlength: 500 },
    website: { type: String, trim: true, maxlength: 200 },
    location: { type: String, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    googleId: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
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
  };
};

module.exports = mongoose.model("User", userSchema);

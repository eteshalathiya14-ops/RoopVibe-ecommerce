const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    phone: { type: String, sparse: true, unique: true },
    authProvider: {
      type: String,
      enum: ["local", "google", "phone"],
      default: "local",
    },
    googleId: { type: String, sparse: true, unique: true },
    avatar: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationOtp: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);

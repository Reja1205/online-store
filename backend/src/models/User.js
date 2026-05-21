const mongoose = require("mongoose");
const { shippingAddressSchemaFields } = require("../constants/address");

const loginHistorySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    device: { type: String, default: "" },
    success: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
      index: true,
    },
    emailVerified: { type: Boolean, default: true, index: true },
    emailVerifiedAt: { type: Date, default: null },
    verificationToken: { type: String, default: null, select: false },
    verificationTokenExpires: { type: Date, default: null, select: false },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    lastLogin: { type: Date, default: null },
    loginHistory: { type: [loginHistorySchema], default: [] },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
    refreshTokenHash: { type: String, default: null, select: false },
    shippingAddress: {
      type: new mongoose.Schema(shippingAddressSchemaFields, { _id: false }),
      default: {},
    },
  },
  { timestamps: true }
);

userSchema.index({ verificationToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ accountLockedUntil: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);

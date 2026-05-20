const mongoose = require("mongoose");
const { shippingAddressSchemaFields } = require("../constants/address");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    shippingAddress: { type: new mongoose.Schema(shippingAddressSchemaFields, { _id: false }), default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
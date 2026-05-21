const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    price: { type: Number, default: 0 },
    qty: { type: Number, default: 1, min: 1 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
  {
    returnNumber: { type: String, unique: true, sparse: true, trim: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, default: "" },
    items: { type: [returnItemSchema], default: [] },
    resolution: {
      type: String,
      enum: ["refund", "replacement"],
      required: true,
    },
    reason: { type: String, required: true, trim: true, maxlength: 2000 },
    customerNotes: { type: String, default: "", trim: true, maxlength: 2000 },
    policyAcknowledged: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "received", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    adminNotes: { type: String, default: "", trim: true, maxlength: 2000 },
    approvedAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    returnDeadline: { type: Date, default: null },
  },
  { timestamps: true }
);

returnRequestSchema.index({ user: 1, createdAt: -1 });
returnRequestSchema.index({ order: 1, status: 1 });

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);

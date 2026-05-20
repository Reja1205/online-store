const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address1: { type: String, default: "" },
    address2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: "", trim: true },

    items: { type: [orderItemSchema], default: [] },

    itemsTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalUSD: { type: Number, default: 0 },

    orderNumber: { type: String, unique: true, sparse: true, trim: true },

    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentProvider: {
      type: String,
      enum: ["mock", "stripe"],
      default: "mock",
    },

    stripeSessionId: { type: String, default: "" },
    stripePaymentIntentId: { type: String, default: "" },
    paidAt: { type: Date },

    notificationEmailSent: { type: Boolean, default: false },
    notificationSmsSent: { type: Boolean, default: false },

    shippingAddress: { type: shippingAddressSchema, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
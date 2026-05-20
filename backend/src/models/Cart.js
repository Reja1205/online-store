const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: { type: String, default: "", trim: true },
    color: { type: String, default: "", trim: true },
    qty: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
      trim: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Partial unique indexes — avoid many guest carts colliding on user: null
cartSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $exists: true, $type: "objectId" } },
  }
);
cartSchema.index(
  { guestId: 1 },
  {
    unique: true,
    partialFilterExpression: { guestId: { $exists: true, $type: "string" } },
  }
);

module.exports = mongoose.model("Cart", cartSchema);

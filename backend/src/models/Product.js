const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
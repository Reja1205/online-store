const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    category: { type: String, default: "", trim: true, index: true },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
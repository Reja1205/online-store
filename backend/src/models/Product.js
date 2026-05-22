const mongoose = require("mongoose");

const sizeStockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const colorImageSchema = new mongoose.Schema(
  {
    color: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    /** Product page accordion — Top highlights (use "Label: value" per line) */
    detailTopHighlights: { type: String, default: "", maxlength: 5000 },
    /** Product page accordion — Style */
    detailStyle: { type: String, default: "", maxlength: 5000 },
    /** Product page accordion — Item details */
    detailItemDetails: { type: String, default: "", maxlength: 5000 },
    /** Shown on catalog cards under the product name */
    shortDescription: { type: String, default: "", trim: true, maxlength: 200 },
    imageUrl: { type: String, default: "" },
    /** Per-color product photos (shop gallery switches by selected color) */
    colorImages: { type: [colorImageSchema], default: [] },
    category: { type: String, default: "", trim: true, index: true },
    /** Optional promotion campaign (summer sale, clearance, etc.) — separate from department category */
    promotionCategory: { type: String, default: "", trim: true, index: true },
    /** Discount % when assigned to a promotion (e.g. 20 = 20% off) */
    promotionPercent: { type: Number, min: 0, max: 100 },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0 },
    /** Offered sizes (men's / women's / kids clothing) */
    sizes: { type: [String], default: [] },
    /** Per-size inventory when sizes are used */
    sizeStock: { type: [sizeStockSchema], default: [] },
    /** Available colors (clothing) */
    colors: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Catalog list: filter by category + sort by newest
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ promotionCategory: 1, createdAt: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
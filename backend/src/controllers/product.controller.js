const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const cloudinary = require("../config/cloudinary");
const {
  isValidCategory,
  normalizeCategorySlug,
  getCategoryMatchValues,
} = require("../constants/categories");

function parseBool(value) {
  if (value === true || value === "true" || value === "1" || value === 1) return true;
  if (value === false || value === "false" || value === "0" || value === 0) return false;
  return undefined;
}

function applyProductFlags(body, target) {
  const featured = parseBool(body?.featured);
  const bestSeller = parseBool(body?.bestSeller);
  const onSale = parseBool(body?.onSale);

  if (featured !== undefined) target.featured = featured;
  if (bestSeller !== undefined) target.bestSeller = bestSeller;
  if (onSale !== undefined) target.onSale = onSale;

  if (onSale === false) {
    target.salePrice = undefined;
  } else if (body?.salePrice !== undefined && body.salePrice !== "") {
    target.salePrice = Number(body.salePrice);
  }
}

function normalizeCategory(raw) {
  return normalizeCategorySlug(raw);
}

function validateCategoryOrRespond(category, res) {
  if (!category) {
    res.status(400).json({ message: "category is required" });
    return false;
  }
  if (!isValidCategory(category)) {
    res.status(400).json({ message: "Invalid category" });
    return false;
  }
  return true;
}

function validateSalePricing(productData, res) {
  if (!productData.onSale) return true;
  const sale = productData.salePrice;
  if (sale == null || sale === "" || Number.isNaN(Number(sale))) {
    res.status(400).json({ message: "salePrice is required when onSale is true" });
    return false;
  }
  if (Number(sale) >= Number(productData.price)) {
    res.status(400).json({ message: "salePrice must be less than price" });
    return false;
  }
  return true;
}

// helper: upload multer memory file to cloudinary, return secure_url
async function uploadToCloudinary(file) {
  const b64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "online-store/products",
  });

  return result.secure_url;
}

// GET /api/products (public) — optional ?category=mens
async function listProducts(req, res) {
  try {
    const filter = {};
    const category = normalizeCategory(req.query?.category);
    if (category) {
      if (!isValidCategory(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      const variants = getCategoryMatchValues(category);
      filter.category = variants.length > 1 ? { $in: variants } : category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json({ products });
  } catch (err) {
    console.error("LIST_PRODUCTS_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/products/:id (public)
async function getProduct(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const similarFilter = { _id: { $ne: product._id } };
    if (product.category) {
      const variants = getCategoryMatchValues(product.category);
      similarFilter.category = variants.length > 1 ? { $in: variants } : product.category;
    }

    const [similarProducts, reviewStats] = await Promise.all([
      Product.find(similarFilter).sort({ createdAt: -1 }).limit(8).lean(),
      Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const summary = reviewStats[0]
      ? {
          count: reviewStats[0].count,
          averageRating: Math.round(reviewStats[0].averageRating * 10) / 10,
        }
      : { count: 0, averageRating: 0 };

    return res.json({ product, similarProducts, reviewSummary: summary });
  } catch (err) {
    console.error("GET_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/products (admin) — multipart image
async function createProduct(req, res) {
  try {
    const { name, price, description, stock, category } = req.body || {};

    if (!name || price === undefined || price === "") {
      return res.status(400).json({ message: "name and price are required" });
    }

    const categorySlug = normalizeCategory(category);
    if (!validateCategoryOrRespond(categorySlug, res)) return;

    const productData = {
      name: String(name).trim(),
      price: Number(price),
      description: description || "",
      category: categorySlug,
      stock: stock === undefined || stock === "" ? 0 : Number(stock),
      imageUrl: "",
    };
    applyProductFlags(req.body, productData);

    if (!validateSalePricing(productData, res)) return;

    let imageWarning = null;
    if (req.file) {
      try {
        productData.imageUrl = await uploadToCloudinary(req.file);
      } catch (uploadErr) {
        console.error("CLOUDINARY_UPLOAD_ERROR:", uploadErr);
        imageWarning =
          "Product saved without image — image upload failed. You can edit the product to retry.";
      }
    } else if (req.body?.imageUrl) {
      productData.imageUrl = String(req.body.imageUrl);
    }

    const product = await Product.create(productData);

    return res.status(201).json({
      message: imageWarning || "Product created",
      product,
      warning: imageWarning || undefined,
    });
  } catch (err) {
    console.error("CREATE_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

function pickUpdates(body) {
  const updates = {};
  const allowed = ["name", "price", "description", "stock", "category", "imageUrl"];

  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (updates.name !== undefined) updates.name = String(updates.name).trim();
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (updates.category !== undefined) updates.category = normalizeCategory(updates.category);

  applyProductFlags(body, updates);
  return updates;
}

// PUT /api/products/:id (admin) — JSON or multipart
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const updates = pickUpdates(req.body);

    if (updates.category !== undefined && !validateCategoryOrRespond(updates.category, res)) {
      return;
    }

    const merged = {
      price: updates.price ?? existing.price,
      onSale: updates.onSale ?? existing.onSale,
      salePrice: updates.salePrice ?? existing.salePrice,
    };
    if (!validateSalePricing(merged, res)) return;

    let imageWarning = null;
    if (req.file) {
      try {
        updates.imageUrl = await uploadToCloudinary(req.file);
      } catch (uploadErr) {
        console.error("CLOUDINARY_UPLOAD_ERROR:", uploadErr);
        imageWarning =
          "Product updated but image upload failed. Other changes were saved.";
      }
    }

    const updateOp = { $set: updates };
    if (updates.onSale === false) {
      updateOp.$unset = { salePrice: "" };
    }

    const product = await Product.findByIdAndUpdate(id, updateOp, {
      new: true,
      runValidators: true,
      timestamps: true,
    });

    return res.json({
      message: imageWarning || "Product updated",
      product,
      warning: imageWarning || undefined,
    });
  } catch (err) {
    console.error("UPDATE_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// DELETE /api/products/:id (admin)
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

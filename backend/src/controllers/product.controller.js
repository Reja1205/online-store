const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Review = require("../models/Review");
const cloudinary = require("../config/cloudinary");
const {
  isValidCategory,
  normalizeCategorySlug,
  getCategoryMatchValues,
} = require("../constants/categories");
const {
  getCategorySizeMode,
  parseSizeStockPayload,
  totalStockFromSizeStock,
} = require("../constants/sizes");
const {
  getCategoryColorMode,
  parseColorsPayload,
} = require("../constants/colors");

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

function applyVariantsToProductData(body, category, target) {
  const sizeMode = getCategorySizeMode(category);
  const colorMode = getCategoryColorMode(category);

  if (!sizeMode) {
    target.sizes = [];
    target.sizeStock = [];
  } else {
    const { sizes, sizeStock } = parseSizeStockPayload(body, category);
    if (sizes.length === 0) return false;
    target.sizes = sizes;
    target.sizeStock = sizeStock;
    target.stock = totalStockFromSizeStock(sizeStock, Number(target.stock || 0));
  }

  if (!colorMode) {
    target.colors = [];
  } else {
    const colors = parseColorsPayload(body, category);
    if (colors.length === 0) return false;
    target.colors = colors;
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

const CATALOG_SELECT =
  "name price salePrice onSale featured bestSeller stock imageUrl category sizes sizeStock colors shortDescription description createdAt updatedAt";
const SIMILAR_SELECT =
  "name price salePrice onSale stock imageUrl category sizes sizeStock colors createdAt";

function parseLimit(raw, fallback = 200) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 500);
}

function parsePage(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildCategoryFilter(rawCategory) {
  const filter = {};
  const category = normalizeCategory(rawCategory);
  if (!category) return { filter, category: null };

  if (!isValidCategory(category)) {
    return { error: "Invalid category" };
  }
  const variants = getCategoryMatchValues(category);
  filter.category = variants.length > 1 ? { $in: variants } : category;
  return { filter, category };
}

// GET /api/products (public)
// Query: ?category=mens&page=1&limit=200&full=1 (admin UI — includes description)
async function listProducts(req, res) {
  const started = process.hrtime.bigint();
  try {
    const built = buildCategoryFilter(req.query?.category);
    if (built.error) {
      return res.status(400).json({ message: built.error });
    }

    const page = parsePage(req.query?.page);
    const limit = parseLimit(req.query?.limit);
    const skip = (page - 1) * limit;
    const fullFields = req.query?.full === "1" || req.query?.full === "true";

    const query = Product.find(built.filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!fullFields) {
      query.select(CATALOG_SELECT);
    }

    const [products, total] = await Promise.all([
      query.exec(),
      Product.countDocuments(built.filter),
    ]);

    const productIds = products.map((p) => p._id);
    let reviewByProduct = new Map();
    if (productIds.length > 0) {
      const stats = await Review.aggregate([
        { $match: { productId: { $in: productIds } } },
        {
          $group: {
            _id: "$productId",
            count: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]);
      reviewByProduct = new Map(
        stats.map((row) => [
          String(row._id),
          {
            count: row.count,
            averageRating: Math.round(row.averageRating * 10) / 10,
          },
        ])
      );
    }

    const productsWithReviews = products.map((p) => ({
      ...p,
      reviewSummary: reviewByProduct.get(String(p._id)) || {
        count: 0,
        averageRating: 0,
      },
    }));

    // Public catalog: allow CDN/browser cache; short TTL keeps admin edits fresh
    res.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=300"
    );

    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    if (process.env.PERF_LOG === "1" || process.env.NODE_ENV === "development") {
      console.log(
        `[PERF] listProducts count=${products.length} total=${total} db=${ms.toFixed(1)}ms`
      );
    }

    return res.json({
      products: productsWithReviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
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
      Product.find(similarFilter)
        .select(SIMILAR_SELECT)
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
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

    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    return res.json({ product, similarProducts, reviewSummary: summary });
  } catch (err) {
    console.error("GET_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/products (admin) — multipart image
async function createProduct(req, res) {
  try {
    const { name, price, description, shortDescription, stock, category } = req.body || {};

    if (!name || price === undefined || price === "") {
      return res.status(400).json({ message: "name and price are required" });
    }

    const categorySlug = normalizeCategory(category);
    if (!validateCategoryOrRespond(categorySlug, res)) return;

    const productData = {
      name: String(name).trim(),
      price: Number(price),
      description: description || "",
      shortDescription: String(shortDescription || "").trim().slice(0, 200),
      category: categorySlug,
      stock: stock === undefined || stock === "" ? 0 : Number(stock),
      imageUrl: "",
    };
    applyProductFlags(req.body, productData);

    if (!applyVariantsToProductData(req.body, categorySlug, productData)) {
      return res.status(400).json({
        message: "Select at least one size and one color for this clothing category",
      });
    }

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
  const allowed = [
    "name",
    "price",
    "description",
    "shortDescription",
    "stock",
    "category",
    "imageUrl",
  ];

  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (updates.name !== undefined) updates.name = String(updates.name).trim();
  if (updates.shortDescription !== undefined) {
    updates.shortDescription = String(updates.shortDescription).trim().slice(0, 200);
  }
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (updates.category !== undefined) updates.category = normalizeCategory(updates.category);

  applyProductFlags(body, updates);

  const variantCategory = updates.category ?? body.category;

  if (
    body.sizeStock !== undefined ||
    body.sizes !== undefined ||
    body.colors !== undefined
  ) {
    const sizeMode = getCategorySizeMode(variantCategory);
    if (sizeMode) {
      const { sizes, sizeStock } = parseSizeStockPayload(body, variantCategory);
      updates.sizes = sizes;
      updates.sizeStock = sizeStock;
      if (sizeStock.length > 0) updates.stock = totalStockFromSizeStock(sizeStock);
    }

    const colorMode = getCategoryColorMode(variantCategory);
    if (colorMode) {
      updates.colors = parseColorsPayload(body, variantCategory);
    }
  } else if (updates.category !== undefined) {
    if (!getCategorySizeMode(updates.category)) {
      updates.sizes = [];
      updates.sizeStock = [];
    }
    if (!getCategoryColorMode(updates.category)) {
      updates.colors = [];
    }
  }

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

    const mergedCategory = updates.category ?? existing.category;
    if (
      req.body?.sizeStock !== undefined ||
      req.body?.sizes !== undefined ||
      updates.category !== undefined
    ) {
      const mergedData = {
        stock: updates.stock ?? existing.stock,
        sizes: updates.sizes ?? existing.sizes,
        sizeStock: updates.sizeStock ?? existing.sizeStock,
      };
      if (getCategorySizeMode(mergedCategory) && (!mergedData.sizes || mergedData.sizes.length === 0)) {
        return res.status(400).json({ message: "Select at least one size for this clothing category" });
      }
      const mergedColors = updates.colors ?? existing.colors;
      if (getCategoryColorMode(mergedCategory) && (!mergedColors || mergedColors.length === 0)) {
        return res.status(400).json({ message: "Select at least one color for this clothing category" });
      }
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
    const message =
      process.env.NODE_ENV === "development" ? err.message : "Server error";
    return res.status(500).json({ message, error: err.message });
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

    await Cart.updateMany(
      { "items.product": product._id },
      { $pull: { items: { product: product._id } } }
    );

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

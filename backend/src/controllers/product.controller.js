const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// helper: upload multer memory file to cloudinary, return secure_url
async function uploadToCloudinary(file) {
  const b64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "online-store/products",
  });

  return result.secure_url;
}

// GET /api/products (public)
async function listProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
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

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ product });
  } catch (err) {
    console.error("GET_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/products (admin)  ✅ supports multipart image
async function createProduct(req, res) {
  try {
    const { name, price, description, stock } = req.body || {};

    if (!name || price === undefined || price === "") {
      return res.status(400).json({ message: "name and price are required" });
    }

    let imageUrl = "";

    // ✅ if file uploaded, store it on cloudinary and save URL
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    } else if (req.body?.imageUrl) {
      // optional fallback if you ever send url directly
      imageUrl = String(req.body.imageUrl);
    }

    const product = await Product.create({
      name: String(name).trim(),
      price: Number(price),
      description: description || "",
      stock: stock === undefined || stock === "" ? 0 : Number(stock),
      imageUrl,
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("CREATE_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PUT /api/products/:id (admin) ✅ supports updating image too
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.imageUrl = await uploadToCloudinary(req.file);
    }

    // normalize number fields if present
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ message: "Product updated", product });
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
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
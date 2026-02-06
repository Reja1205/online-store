const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// helper: upload buffer to cloudinary
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
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

// POST /api/products/upload (admin)  multipart/form-data field: image
async function uploadProductImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadBufferToCloudinary(req.file.buffer);

    return res.status(201).json({
      message: "Uploaded",
      imageUrl: result.secure_url, // ✅ frontend should use THIS
    });
  } catch (err) {
    console.error("UPLOAD_IMAGE_ERROR:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
}

// POST /api/products (admin) JSON body
async function createProduct(req, res) {
  try {
    const { name, price, description, imageUrl, stock } = req.body || {};

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const product = await Product.create({
      name: String(name).trim(),
      price: Number(price),
      description: description || "",
      imageUrl: imageUrl || "", // ✅ this must be saved
      stock: stock === undefined ? 0 : Number(stock),
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("CREATE_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/products/:id (admin)
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const updates = req.body || {};
    const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true });

    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Product updated", product });
  } catch (err) {
    console.error("UPDATE_PRODUCT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
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
  uploadProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
};
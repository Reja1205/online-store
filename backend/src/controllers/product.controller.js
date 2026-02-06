const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// helper upload
async function uploadImage(file) {
  if (!file) return "";

  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "products",
  });

  return result.secure_url;
}

// GET /api/products
async function listProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ products });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/products/:id
async function getProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.json({ product });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const { name, price, description, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const imageUrl = await uploadImage(req.file);

    const product = await Product.create({
      name,
      price: Number(price),
      description: description || "",
      stock: stock || 0,
      imageUrl,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.imageUrl = await uploadImage(req.file);
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    res.json({ product });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE
async function deleteProduct(req, res) {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
const Product = require("../models/Product");

// GET /api/products (public)
async function listProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
}

// GET /api/products/:id (public)
async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
}

// POST /api/products (admin)
async function createProduct(req, res) {
  const { name, price, description, imageUrl, stock } = req.body || {};

  if (!name || price === undefined) {
    return res.status(400).json({ message: "name and price are required" });
  }

  const product = await Product.create({
    name: String(name).trim(),
    price: Number(price),
    description: description || "",
    imageUrl: imageUrl || "",
    stock: stock === undefined ? 0 : Number(stock),
  });

  res.status(201).json({ message: "Product created", product });
}

// PUT /api/products/:id (admin)
async function updateProduct(req, res) {
  const updates = req.body || {};

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true }
  );

  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product updated", product });
}

// DELETE /api/products/:id (admin)
async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
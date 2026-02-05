const Product = require("../models/Product");

// GET /api/products (public)
// Supports:
// ?search=iphone
// ?minPrice=10&maxPrice=100
// ?sort=newest | price_asc | price_desc
async function listProducts(req, res) {
  try {
    const { search = "", minPrice, maxPrice, sort = "newest" } = req.query;

    const filter = {};

    // Search in name + description
    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };

    const products = await Product.find(filter).sort(sortObj);
    return res.json({ products });
  } catch (err) {
    console.error("LIST_PRODUCTS_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  listProducts,
  // keep the rest exactly as you have:
  // getProduct,
  // createProduct,
  // updateProduct,
  // deleteProduct,
};
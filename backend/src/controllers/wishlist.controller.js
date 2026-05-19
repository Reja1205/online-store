const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

async function getWishlist(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const doc = await Wishlist.findOne({ userId }).lean();
    const ids = doc?.productIds || [];
    if (!ids.length) return res.json({ productIds: [], products: [] });

    const products = await Product.find({ _id: { $in: ids } }).lean();
    return res.json({ productIds: ids.map(String), products });
  } catch (err) {
    console.error("GET_WISHLIST_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function addToWishlist(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const productId = req.body?.productId || req.params?.productId;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const doc = await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { productIds: productId } },
      { upsert: true, new: true }
    );

    return res.json({
      message: "Added to wishlist",
      productIds: doc.productIds.map(String),
    });
  } catch (err) {
    console.error("ADD_WISHLIST_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const doc = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { productIds: productId } },
      { new: true }
    );

    return res.json({
      message: "Removed from wishlist",
      productIds: (doc?.productIds || []).map(String),
    });
  } catch (err) {
    console.error("REMOVE_WISHLIST_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };

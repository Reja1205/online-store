const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

async function listProductReviews(req, res) {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).limit(50).lean();

    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const summary = stats[0]
      ? { count: stats[0].count, averageRating: Math.round(stats[0].averageRating * 10) / 10 }
      : { count: 0, averageRating: 0 };

    return res.json({ reviews, summary });
  } catch (err) {
    console.error("LIST_REVIEWS_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createProductReview(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId).select("_id name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || "").trim();
    const dbUser = await User.findById(userId).select("name").lean();
    const userName = String(dbUser?.name || req.body?.userName || "Customer").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment) return res.status(400).json({ message: "Review comment is required" });

    const existing = await Review.findOne({ productId, userId });
    if (existing) {
      return res.status(409).json({ message: "You already reviewed this product. Edit is not supported yet." });
    }

    const review = await Review.create({
      productId,
      userId,
      userName,
      rating,
      comment,
    });

    return res.status(201).json({ message: "Review posted", review });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "You already reviewed this product." });
    }
    console.error("CREATE_REVIEW_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { listProductReviews, createProductReview };

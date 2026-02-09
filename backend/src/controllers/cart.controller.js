const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// helper
function toId(v) {
  try {
    return v ? String(v) : "";
  } catch {
    return "";
  }
}

// GET /api/cart
async function getCart(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name price stock imageUrl");

    if (!cart) return res.json({ cart: { items: [] } });

    // ✅ Always include productId even if product was deleted (product becomes null)
    const items = (cart.items || []).map((it) => {
      const productId = toId(it.product?._id || it.product); // if populated, _id exists; if not, keep raw id
      const p = it.product; // may be null

      return {
        productId,
        qty: Number(it.qty || 1),
        product: p
          ? {
              _id: toId(p._id),
              name: p.name || "",
              price: Number(p.price || 0),
              stock: Number(p.stock || 0),
              imageUrl: p.imageUrl || "",
            }
          : null,
      };
    });

    return res.json({ cart: { items } });
  } catch (err) {
    console.error("GET_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/cart/add  Body: { productId, qty }
async function addToCart(req, res) {
  try {
    const { productId, qty } = req.body || {};
    if (!productId) return res.status(400).json({ message: "productId is required" });

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const quantity = Math.max(1, Number(qty || 1));

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    const idx = cart.items.findIndex((it) => String(it.product) === String(productId));
    if (idx >= 0) cart.items[idx].qty += quantity;
    else cart.items.push({ product: productId, qty: quantity });

    await cart.save();
    return res.json({ message: "Added", cart });
  } catch (err) {
    console.error("ADD_TO_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/cart/remove  Body: { productId }
async function removeFromCart(req, res) {
  try {
    // ✅ accept productId OR product (just in case UI sends the other key)
    const productId = req.body?.productId || req.body?.product;

    if (!productId) return res.status(400).json({ message: "productId is required" });

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.json({ message: "Removed", cart: { items: [] } });

    cart.items = cart.items.filter((it) => String(it.product) !== String(productId));
    await cart.save();

    return res.json({ message: "Removed", cart });
  } catch (err) {
    console.error("REMOVE_FROM_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};
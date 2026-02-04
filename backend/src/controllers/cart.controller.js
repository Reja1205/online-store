const Cart = require("../models/Cart");
const Product = require("../models/Product");

// helper: get or create cart
async function getCartDoc(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// GET /api/cart  (logged in)
async function getCart(req, res) {
  try {
    const cart = await getCartDoc(req.user.id);

    // populate products for UI
    const populated = await Cart.findById(cart._id).populate("items.product");

    return res.json({ cart: populated });
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

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const cart = await getCartDoc(req.user.id);

    const q = Math.max(1, Number(qty || 1));

    const idx = cart.items.findIndex((it) => String(it.product) === String(productId));
    if (idx >= 0) cart.items[idx].qty += q;
    else cart.items.push({ product: productId, qty: q });

    await cart.save();

    const populated = await Cart.findById(cart._id).populate("items.product");
    return res.json({ message: "Added to cart", cart: populated });
  } catch (err) {
    console.error("ADD_TO_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/cart/remove  Body: { productId }
async function removeFromCart(req, res) {
  try {
    const { productId } = req.body || {};
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const cart = await getCartDoc(req.user.id);
    cart.items = cart.items.filter((it) => String(it.product) !== String(productId));
    await cart.save();

    const populated = await Cart.findById(cart._id).populate("items.product");
    return res.json({ message: "Removed", cart: populated });
  } catch (err) {
    console.error("REMOVE_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/cart/clear
async function clearCart(req, res) {
  try {
    const cart = await getCartDoc(req.user.id);
    cart.items = [];
    await cart.save();
    return res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("CLEAR_CART_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { getCart, addToCart, removeFromCart, clearCart };
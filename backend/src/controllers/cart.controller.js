const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET /api/cart  (user)
async function getMyCart(req, res) {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  return res.json({ cart: cart || { user: req.user.id, items: [] } });
}

// POST /api/cart/add  (user)
// body: { productId, qty }
async function addToCart(req, res) {
  const { productId, qty } = req.body || {};

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const addQty = qty ? Math.max(1, Number(qty)) : 1;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [{ product: productId, qty: addQty }],
    });
  } else {
    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx >= 0) cart.items[idx].qty += addQty;
    else cart.items.push({ product: productId, qty: addQty });

    await cart.save();
  }

  cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  return res.status(200).json({ message: "Added to cart", cart });
}

// PUT /api/cart/item/:productId  (user)
// body: { qty }
async function updateCartItem(req, res) {
  const { qty } = req.body || {};
  const productId = req.params.productId;

  const newQty = Number(qty);
  if (!newQty || newQty < 1) {
    return res.status(400).json({ message: "qty must be >= 1" });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.qty = newQty;
  await cart.save();

  const populated = await Cart.findOne({ user: req.user.id }).populate("items.product");
  return res.json({ message: "Cart updated", cart: populated });
}

// DELETE /api/cart/item/:productId  (user)
async function removeCartItem(req, res) {
  const productId = req.params.productId;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();

  const populated = await Cart.findOne({ user: req.user.id }).populate("items.product");
  return res.json({ message: "Item removed", cart: populated });
}

// POST /api/cart/clear  (user)
async function clearCart(req, res) {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.json({ message: "Cart cleared", cart: { user: req.user.id, items: [] } });

  cart.items = [];
  await cart.save();

  return res.json({ message: "Cart cleared", cart });
}

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
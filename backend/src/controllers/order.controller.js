const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// POST /api/orders  (user creates an order from their cart)
async function createOrder(req, res) {
  try {
    // You can adjust this based on your cart schema.
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build order items from cart
    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      qty: i.qty,
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      status: "pending",
    });

    // Optional: clear cart after order
    cart.items = [];
    await cart.save();

    return res.status(201).json({ message: "Order created", order });
  } catch (err) {
    console.error("CREATE_ORDER_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/orders/my  (user sees their orders)
async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ orders });
}

// GET /api/orders  (admin sees all orders)
async function allOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ orders });
}

// PATCH /api/orders/:id/status (admin updates status)
async function updateStatus(req, res) {
  const { status } = req.body || {};
  const allowed = ["pending", "paid", "shipped", "delivered", "cancelled"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { new: true }
  );

  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ message: "Status updated", order });
}

module.exports = { createOrder, myOrders, allOrders, updateStatus };
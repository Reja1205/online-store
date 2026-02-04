
const Order = require("../models/Order");

// GET /api/orders/my
async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  return res.json({ orders });
}

// GET /api/orders/:id  (owner or admin)
async function getOrderById(req, res) {
  const order = await Order.findById(req.params.id).populate("user", "name email role");
  if (!order) return res.status(404).json({ message: "Order not found" });

  const isOwner = order.user?._id?.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

  return res.json({ order });
}

// GET /api/orders  (admin)
async function allOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email role");
  return res.json({ orders });
}

module.exports = { myOrders, getOrderById, allOrders };
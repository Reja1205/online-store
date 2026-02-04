const Order = require("../models/Order");

// USER – create order
async function createOrder(req, res) {
  try {
    const { items, total, address } = req.body || {};

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items" });
    }

    const order = await Order.create({
      userId: req.user._id,
      items,
      total,
      address: address || "",
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// USER – see own orders
async function myOrders(req, res) {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
}

// ADMIN – see all orders
async function allOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ orders });
}

// ADMIN – update status
async function updateStatus(req, res) {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json({ order });
}

module.exports = { createOrder, myOrders, allOrders, updateStatus };
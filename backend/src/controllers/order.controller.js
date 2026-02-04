const Order = require("../models/Order");

// helper: compute totals even if old orders are missing fields
function normalizeOrder(orderDoc) {
  const o = orderDoc.toObject ? orderDoc.toObject() : orderDoc;

  const items = Array.isArray(o.items) ? o.items : [];

  const itemsTotal = items.reduce((sum, it) => {
    const qty = Number(it.qty || 0);
    const price = Number(it.price || 0);
    const line = Number(it.lineTotal);

    return sum + (Number.isFinite(line) ? line : price * qty);
  }, 0);

  const shippingFee = Number(o.shippingFee ?? process.env.SHIPPING_FEE_USD ?? 0);
  const totalUSD = Number(o.totalUSD ?? itemsTotal + shippingFee);

  return { ...o, itemsTotal, shippingFee, totalUSD };
}

// GET /api/orders/my
async function myOrders(req, res) {
  try {
    const docs = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    const orders = docs.map(normalizeOrder);
    return res.json({ orders });
  } catch (err) {
    console.error("MY_ORDERS_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/orders  (admin)
async function allOrders(req, res) {
  try {
    const docs = await Order.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    const orders = docs.map(normalizeOrder);
    return res.json({ orders });
  } catch (err) {
    console.error("ALL_ORDERS_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PUT /api/orders/:id/status (admin)
async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: "status is required" });

    const doc = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ message: "Order not found" });

    return res.json({ message: "Status updated", order: normalizeOrder(doc) });
  } catch (err) {
    console.error("UPDATE_STATUS_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { myOrders, allOrders, updateOrderStatus };
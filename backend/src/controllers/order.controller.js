// helper: compute totals even if old orders are missing fields
function normalizeOrder(orderDoc) {
  const o = orderDoc.toObject ? orderDoc.toObject() : orderDoc;

  const items = Array.isArray(o.items) ? o.items : [];

  const itemsTotal = items.reduce((sum, it) => {
    const qty = Number(it.qty || 0);
    const price = Number(it.price || 0);
    const line = Number(it.lineTotal);
    // prefer saved lineTotal, else compute price*qty
    return sum + (Number.isFinite(line) ? line : price * qty);
  }, 0);

  const shippingFee = Number(o.shippingFee ?? process.env.SHIPPING_FEE_USD ?? 0);
  const totalUSD = Number(o.totalUSD ?? itemsTotal + shippingFee);

  return {
    ...o,
    itemsTotal,
    shippingFee,
    totalUSD,
  };
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

// GET /api/orders (admin)
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
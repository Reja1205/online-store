const Order = require("../models/Order");
const Product = require("../models/Product");
const { enrichOrdersWithReturns } = require("../services/return.service");

// helper: compute totals even if some older orders are missing fields
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

// POST /api/orders
// Body: { items: [{ productId, qty }] }
async function createOrder(req, res) {
  try {
    const bodyItems = req.body?.items || [];

    if (!Array.isArray(bodyItems) || bodyItems.length === 0) {
      return res.status(400).json({ message: "items are required" });
    }

    // load products to get real price/name from DB
    const ids = bodyItems.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const items = bodyItems.map((i) => {
      const p = byId.get(String(i.productId));
      if (!p) throw new Error("Invalid productId: " + i.productId);

      const qty = Math.max(1, Number(i.qty || 1));
      const price = Number(p.price ?? p.priceUSD ?? 0);
      const lineTotal = price * qty;

      return {
        product: p._id,
        name: p.name ?? p.title ?? "Product",
        price,
        qty,
        lineTotal,
      };
    });

    const itemsTotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
    const shippingFee = Number(process.env.SHIPPING_FEE_USD || 0);
    const totalUSD = itemsTotal + shippingFee;

    const order = await Order.create({
      user: req.user.id, // ✅ ties order to logged-in user
      items,
      itemsTotal,
      shippingFee,
      totalUSD,
      status: "pending",
    });

    return res.status(201).json({ message: "Order created", order: normalizeOrder(order) });
  } catch (err) {
    console.error("CREATE_ORDER_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/orders/my
async function myOrders(req, res) {
  try {
    const docs = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    const normalized = docs.map(normalizeOrder);
    const orders = await enrichOrdersWithReturns(normalized, req.user.id);
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

// PUT /api/orders/:id/status (admin)
async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: "status is required" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json({ message: "Status updated", order: normalizeOrder(order) });
  } catch (err) {
    console.error("UPDATE_STATUS_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  createOrder,
  myOrders,
  allOrders,
  updateOrderStatus,
};
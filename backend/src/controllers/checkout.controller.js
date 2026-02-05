const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

function computeTotals(items) {
  const itemsTotal = items.reduce((sum, it) => sum + Number(it.lineTotal || 0), 0);
  const shippingFee = Number(process.env.SHIPPING_FEE_USD || 0);
  const totalUSD = itemsTotal + shippingFee;
  return { itemsTotal, shippingFee, totalUSD };
}

// GET /api/checkout/preview
// returns what will be charged (based on current DB prices)
async function previewCheckout(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.json({ items: [], itemsTotal: 0, shippingFee: Number(process.env.SHIPPING_FEE_USD || 0), totalUSD: Number(process.env.SHIPPING_FEE_USD || 0) });
    }

    const items = cart.items.map((ci) => {
      const p = ci.product;
      const qty = Math.max(1, Number(ci.qty || 1));
      const price = Number(p?.price ?? 0);
      return {
        product: p?._id,
        name: p?.name || "Product",
        price,
        qty,
        lineTotal: price * qty,
      };
    });

    const totals = computeTotals(items);

    return res.json({
      items,
      ...totals,
    });
  } catch (err) {
    console.error("PREVIEW_CHECKOUT_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/checkout/pay
// body: { shippingAddress: {...} }
// creates PAID order and clears cart
async function payCheckout(req, res) {
  try {
    const shippingAddress = req.body?.shippingAddress || {};

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Load products from DB to get correct prices
    const ids = cart.items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: ids } });

    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const items = cart.items.map((ci) => {
      const p = byId.get(String(ci.product));
      if (!p) throw new Error("Invalid productId in cart: " + ci.product);

      const qty = Math.max(1, Number(ci.qty || 1));
      const price = Number(p.price ?? 0);

      return {
        product: p._id,
        name: p.name || "Product",
        price,
        qty,
        lineTotal: price * qty,
      };
    });

    const totals = computeTotals(items);

    const order = await Order.create({
      user: req.user.id,
      items,
      ...totals,
      status: "paid", // ✅ mock “payment success”
      shippingAddress: {
        fullName: shippingAddress.fullName || "",
        email: shippingAddress.email || "",
        phone: shippingAddress.phone || "",
        address1: shippingAddress.address1 || "",
        address2: shippingAddress.address2 || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode || "",
        country: shippingAddress.country || "",
      },
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({ message: "Payment successful", order });
  } catch (err) {
    console.error("PAY_CHECKOUT_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { previewCheckout, payCheckout };
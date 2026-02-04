const Order = require("../models/Order");
const Product = require("../models/Product");

async function checkout(req, res) {
  try {
    const items = req.body?.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const ids = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } });

    const map = new Map(products.map(p => [p._id.toString(), p]));

    const orderItems = items.map(i => {
      const p = map.get(String(i.productId));
      if (!p) throw new Error("Invalid product");

      const qty = Math.max(1, Number(i.qty || 1));
      const price = Number(p.price || 0);
      const lineTotal = price * qty;

      return {
        product: p._id,
        name: p.name,
        price,
        qty,
        lineTotal
      };
    });

    const itemsTotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
    const shippingFee = Number(process.env.SHIPPING_FEE_USD || 0);
    const totalUSD = itemsTotal + shippingFee;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      itemsTotal,
      shippingFee,
      totalUSD,
      status: "pending"
    });

    res.status(201).json({ message: "Checkout success", order });

  } catch (err) {
    console.error("CHECKOUT_ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { checkout };
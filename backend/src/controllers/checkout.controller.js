const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function checkout(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // load product data fresh from DB
    const ids = cart.items.map((it) => it.product);
    const products = await Product.find({ _id: { $in: ids } });

    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const items = cart.items.map((it) => {
      const p = byId.get(String(it.product));
      if (!p) throw new Error("Invalid product in cart: " + it.product);

      const qty = Math.max(1, Number(it.qty || 1));
      const price = Number(p.price || 0);
      const lineTotal = price * qty;

      return {
        product: p._id,
        name: p.name,
        price,
        qty,
        lineTotal,
      };
    });

    const itemsTotal = items.reduce((s, it) => s + it.lineTotal, 0);
    const shippingFee = Number(process.env.SHIPPING_FEE_USD || 0);
    const totalUSD = itemsTotal + shippingFee;

    const order = await Order.create({
      user: req.user.id,
      items,
      itemsTotal,
      shippingFee,
      totalUSD,
      status: "pending",
    });

    // clear cart after successful checkout
    cart.items = [];
    await cart.save();

    return res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    console.error("CHECKOUT_ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { checkout };
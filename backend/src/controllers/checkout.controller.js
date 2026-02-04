
const Cart = require("../models/Cart");
const Order = require("../models/Order");

function toNumber(n, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

// POST /api/checkout
async function checkout(req, res) {
  const shippingFee = toNumber(process.env.SHIPPING_FEE_USD, 0);

  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const items = cart.items.map((i) => ({
    productId: i.product?._id,
    name: i.product?.name || "Unknown",
    price: toNumber(i.product?.price, 0),
    qty: toNumber(i.qty, 1),
  }));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const total = subtotal + shippingFee;

  const order = await Order.create({
    user: req.user.id,
    items,
    shippingFee,
    subtotal,
    total,
    status: "pending",
  });

  // clear cart after order created
  cart.items = [];
  await cart.save();

  return res.status(201).json({
    message: "Order placed",
    order: {
      id: order._id,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    },
  });
}

module.exports = { checkout };

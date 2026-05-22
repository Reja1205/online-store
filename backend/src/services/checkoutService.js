const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { findCart } = require("../utils/cartOwner");
const {
  normalizeShippingAddress,
  validateShippingAddress,
} = require("../constants/address");
const { calculateShippingFee, getShippingOptions, FREE_SHIPPING_MIN_USD } = require("./shipping");
const {
  countMensTshirtQty,
  MENS_TSHIRT_FREE_SHIPPING_MIN_QTY,
  qualifiesMensTshirtFreeShipping,
} = require("../constants/freeShippingPromos");
const {
  lineUnitPrice,
  validateCartInventory,
  decrementInventory,
} = require("./inventory");
const { regularPrice } = require("../utils/productPricing");
const { sendOrderNotifications } = require("./notifications");
const {
  isStripeEnabled,
  createCheckoutSession,
  retrieveSession,
} = require("./stripePayment");

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

async function loadCartWithProducts(owner) {
  const cart = await findCart(owner);
  if (!cart?.items?.length) return { cart: null, productsById: new Map() };

  await cart.populate("items.product");
  const ids = cart.items.map((i) => i.product?._id || i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const productsById = new Map(products.map((p) => [p._id.toString(), p]));

  return { cart, productsById };
}

function buildLineItemsFromCart(cart, productsById) {
  return cart.items.map((ci) => {
    const pid = String(ci.product?._id || ci.product);
    const p = productsById.get(pid);
    if (!p) throw new Error("Product no longer available: " + pid);

    const qty = Math.max(1, Number(ci.qty || 1));
    const originalPrice = regularPrice(p);
    const price = lineUnitPrice(p);
    const originalLineTotal = Math.round(originalPrice * qty * 100) / 100;
    const lineTotal = Math.round(price * qty * 100) / 100;
    const lineDiscount = Math.max(0, Math.round((originalLineTotal - lineTotal) * 100) / 100);
    const size = String(ci.size || "").trim();
    const color = String(ci.color || "").trim();
    const baseName = p.name || "Product";
    const label = [baseName, color, size].filter(Boolean).join(" — ");

    return {
      product: p._id,
      name: label,
      size,
      color,
      originalPrice,
      price,
      qty,
      originalLineTotal,
      lineTotal,
      lineDiscount,
    };
  });
}

function summarizeCheckoutItems(items) {
  const itemsSubtotalOriginal = items.reduce((sum, it) => sum + Number(it.originalLineTotal || 0), 0);
  const itemsTotal = items.reduce((sum, it) => sum + Number(it.lineTotal || 0), 0);
  const discountTotal = Math.max(
    0,
    Math.round((itemsSubtotalOriginal - itemsTotal) * 100) / 100
  );
  return { itemsSubtotalOriginal, itemsTotal, discountTotal };
}

async function buildCheckoutPreview(owner, shippingMethod = "standard") {
  const { cart, productsById } = await loadCartWithProducts(owner);

  const shippingOpts = { mensTshirtQty: 0 };

  if (!cart) {
    const shipping = calculateShippingFee(0, shippingMethod, shippingOpts);
    return {
      items: [],
      itemsSubtotalOriginal: 0,
      discountTotal: 0,
      itemsTotal: 0,
      shippingFee: shipping.shippingFee,
      totalUSD: shipping.shippingFee,
      shippingMethod: shipping.shippingMethod,
      shippingOptions: getShippingOptions(0, shippingOpts),
      freeShippingMin: FREE_SHIPPING_MIN_USD,
      mensTshirtQtyInCart: 0,
      mensTshirtFreeShippingMinQty: MENS_TSHIRT_FREE_SHIPPING_MIN_QTY,
      mensTshirtFreeShippingEligible: false,
      paymentProvider: isStripeEnabled() ? "stripe" : "mock",
    };
  }

  const items = buildLineItemsFromCart(cart, productsById);
  const { itemsSubtotalOriginal, itemsTotal, discountTotal } = summarizeCheckoutItems(items);
  const mensTshirtQtyInCart = countMensTshirtQty(cart.items, productsById);
  shippingOpts.mensTshirtQty = mensTshirtQtyInCart;
  const shipping = calculateShippingFee(itemsTotal, shippingMethod, shippingOpts);
  const inventoryErrors = validateCartInventory(cart.items, productsById);
  const mensTshirtFreeShippingEligible = qualifiesMensTshirtFreeShipping(mensTshirtQtyInCart);

  return {
    items,
    itemsSubtotalOriginal,
    discountTotal,
    itemsTotal,
    shippingFee: shipping.shippingFee,
    totalUSD: itemsTotal + shipping.shippingFee,
    shippingMethod: shipping.shippingMethod,
    shippingLabel: shipping.label,
    shippingEta: shipping.eta,
    freeShippingApplied: shipping.freeShippingApplied,
    freeShippingReason: shipping.freeShippingReason,
    shippingOptions: getShippingOptions(itemsTotal, shippingOpts),
    freeShippingMin: FREE_SHIPPING_MIN_USD,
    mensTshirtQtyInCart,
    mensTshirtFreeShippingMinQty: MENS_TSHIRT_FREE_SHIPPING_MIN_QTY,
    mensTshirtFreeShippingEligible,
    inventoryOk: inventoryErrors.length === 0,
    inventoryErrors,
    paymentProvider: isStripeEnabled() ? "stripe" : "mock",
  };
}

async function finalizePaidOrder(order, cart, productsById, cartOwner) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const freshProducts = await Product.find({
      _id: { $in: order.items.map((i) => i.product) },
    }).session(session);
    const byId = new Map(freshProducts.map((p) => [p._id.toString(), p]));

    const pseudoCartItems = order.items.map((line) => ({
      product: line.product,
      size: line.size,
      qty: line.qty,
    }));
    const stockErrors = validateCartInventory(pseudoCartItems, byId);
    if (stockErrors.length) {
      throw new Error(stockErrors.join("; "));
    }

    await decrementInventory(order.items, byId, session);

    order.status = "paid";
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    await order.save({ session });

    if (cart) {
      cart.items = [];
      await cart.save({ session });
    }

    await session.commitTransaction();

    const notify = await sendOrderNotifications(order.toObject ? order.toObject() : order);
    order.notificationEmailSent = Boolean(notify.email?.sent);
    order.notificationSmsSent = Boolean(notify.sms?.sent);
    await order.save();

    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function createPendingOrder({ cartOwner, user, body }) {
  const shippingAddress = normalizeShippingAddress(body?.shippingAddress || {});
  const addrCheck = validateShippingAddress(shippingAddress);
  if (!addrCheck.ok) {
    const err = new Error(addrCheck.message);
    err.status = 400;
    throw err;
  }

  const shippingMethod = body?.shippingMethod === "express" ? "express" : "standard";
  const { cart, productsById } = await loadCartWithProducts(cartOwner);

  if (!cart?.items?.length) {
    const err = new Error("Cart is empty");
    err.status = 400;
    throw err;
  }

  const inventoryErrors = validateCartInventory(cart.items, productsById);
  if (inventoryErrors.length) {
    const err = new Error(inventoryErrors.join("; "));
    err.status = 400;
    throw err;
  }

  const items = buildLineItemsFromCart(cart, productsById);
  const { itemsSubtotalOriginal, itemsTotal, discountTotal } = summarizeCheckoutItems(items);
  const mensTshirtQtyInCart = countMensTshirtQty(cart.items, productsById);
  const shipping = calculateShippingFee(itemsTotal, shippingMethod, {
    mensTshirtQty: mensTshirtQtyInCart,
  });

  const orderPayload = {
    orderNumber: generateOrderNumber(),
    items,
    itemsSubtotalOriginal,
    discountTotal,
    itemsTotal,
    shippingFee: shipping.shippingFee,
    totalUSD: itemsTotal + shipping.shippingFee,
    shippingMethod: shipping.shippingMethod,
    status: "pending",
    paymentStatus: "pending",
    paymentProvider: isStripeEnabled() ? "stripe" : "mock",
    shippingAddress,
  };

  if (user?.id) {
    orderPayload.user = user.id;
    if (body?.saveToProfile !== false) {
      await User.findByIdAndUpdate(user.id, { $set: { shippingAddress } });
    }
  } else if (cartOwner?.type === "guest") {
    orderPayload.guestId = cartOwner.id;
  }

  const order = await Order.create(orderPayload);
  return { order, cart, productsById, items };
}

/** Mock payment — completes order immediately when Stripe is not configured. */
async function placeOrderMock(cartOwner, user, body) {
  const { order, cart, productsById } = await createPendingOrder({ cartOwner, user, body });
  const completed = await finalizePaidOrder(order, cart, productsById, cartOwner);
  return {
    order: completed,
    paymentProvider: "mock",
    redirectUrl: null,
  };
}

/** Stripe Checkout — pending order until webhook or session verify. */
async function placeOrderStripe(cartOwner, user, body) {
  const { order, cart, productsById, items } = await createPendingOrder({
    cartOwner,
    user,
    body,
  });

  const stripeLineItems = [...items];
  if (order.shippingFee > 0) {
    stripeLineItems.push({
      name: order.shippingMethod === "express" ? "Express shipping" : "Standard shipping",
      price: order.shippingFee,
      qty: 1,
      lineTotal: order.shippingFee,
    });
  }

  const session = await createCheckoutSession({
    order,
    lineItems: stripeLineItems,
    customerEmail: order.shippingAddress?.email,
  });

  if (!session?.url) {
    await Order.findByIdAndDelete(order._id);
    const err = new Error("Could not start payment session");
    err.status = 500;
    throw err;
  }

  order.stripeSessionId = session.id;
  order.paymentProvider = "stripe";
  await order.save();

  return {
    order,
    paymentProvider: "stripe",
    redirectUrl: session.url,
    sessionId: session.id,
  };
}

async function placeOrder(cartOwner, user, body) {
  if (isStripeEnabled() && body?.paymentMode !== "mock") {
    return placeOrderStripe(cartOwner, user, body);
  }
  return placeOrderMock(cartOwner, user, body);
}

async function completeOrderByStripeSession(sessionId) {
  const session = await retrieveSession(sessionId);
  if (!session) return null;

  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId) return null;

  const order = await Order.findById(orderId);
  if (!order) return null;

  if (order.paymentStatus === "paid") return order;

  if (session.payment_status !== "paid") {
    return order;
  }

  const { cart, productsById } = await loadCartWithProducts({
    type: order.guestId ? "guest" : "user",
    id: order.guestId || String(order.user),
  });

  order.stripePaymentIntentId = session.payment_intent || "";
  await finalizePaidOrder(order, cart, productsById, null);
  return await Order.findById(orderId);
}

async function handleStripeWebhookEvent(event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    return completeOrderByStripeSession(session.id);
  }
  return null;
}

function canAccessOrder(order, req) {
  if (!order) return false;
  if (req.user?.id && order.user && String(order.user) === String(req.user.id)) return true;
  if (req.cartOwner?.type === "guest" && order.guestId === req.cartOwner.id) return true;
  return false;
}

module.exports = {
  buildCheckoutPreview,
  placeOrder,
  placeOrderMock,
  completeOrderByStripeSession,
  handleStripeWebhookEvent,
  canAccessOrder,
  generateOrderNumber,
};

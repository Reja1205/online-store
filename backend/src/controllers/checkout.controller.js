const checkoutService = require("../services/checkoutService");
const { isStripeEnabled } = require("../services/stripePayment");
const {
  isEmailConfigured,
  isSmsConfigured,
} = require("../services/notifications");

// GET /api/checkout/config — which payment/notify providers are active
async function checkoutConfig(req, res) {
  return res.json({
    stripe: isStripeEnabled(),
    email: isEmailConfigured(),
    sms: isSmsConfigured(),
    storeName: process.env.STORE_NAME || "BigBag",
  });
}

// GET /api/checkout/preview?shippingMethod=standard
async function previewCheckout(req, res) {
  try {
    const shippingMethod = req.query?.shippingMethod || "standard";
    const preview = await checkoutService.buildCheckoutPreview(
      req.cartOwner,
      shippingMethod
    );
    return res.json(preview);
  } catch (err) {
    console.error("PREVIEW_CHECKOUT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/checkout/place-order
// body: { shippingAddress, shippingMethod, saveToProfile?, paymentMode? }
async function placeOrder(req, res) {
  try {
    const result = await checkoutService.placeOrder(req.cartOwner, req.user, req.body);
    const order = result.order;
    return res.status(201).json({
      message:
        result.paymentProvider === "stripe"
          ? "Redirect to payment"
          : "Order placed successfully",
      order,
      paymentProvider: result.paymentProvider,
      redirectUrl: result.redirectUrl || null,
      sessionId: result.sessionId || null,
      notifications:
        order?.paymentStatus === "paid"
          ? {
              email: {
                sent: Boolean(order.notificationEmailSent),
                configured: isEmailConfigured(),
              },
              sms: {
                sent: Boolean(order.notificationSmsSent),
                configured: isSmsConfigured(),
              },
            }
          : null,
    });
  } catch (err) {
    console.error("PLACE_ORDER_ERROR:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Could not place order",
    });
  }
}

/** Legacy alias for mock pay */
async function payCheckout(req, res) {
  req.body = { ...req.body, paymentMode: "mock" };
  return placeOrder(req, res);
}

// GET /api/checkout/confirm?session_id= | orderId=
async function confirmCheckout(req, res) {
  try {
    const sessionId = req.query?.session_id;
    const orderId = req.query?.orderId;

    let order = null;

    if (sessionId) {
      order = await checkoutService.completeOrderByStripeSession(sessionId);
    } else if (orderId) {
      const Order = require("../models/Order");
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!checkoutService.canAccessOrder(order, req)) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({
      order,
      notifications: {
        email: {
          sent: Boolean(order.notificationEmailSent),
          configured: isEmailConfigured(),
        },
        sms: {
          sent: Boolean(order.notificationSmsSent),
          configured: isSmsConfigured(),
        },
      },
    });
  } catch (err) {
    console.error("CONFIRM_CHECKOUT_ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/checkout/webhook — Stripe (raw body)
async function stripeWebhook(req, res) {
  try {
    const signature = req.headers["stripe-signature"];
    const event = await constructWebhookEvent(req.body, signature);

    if (!event) {
      return res.status(400).json({ message: "Webhook not configured or invalid signature" });
    }

    await checkoutService.handleStripeWebhookEvent(event);
    return res.json({ received: true });
  } catch (err) {
    console.error("STRIPE_WEBHOOK_ERROR:", err);
    return res.status(400).json({ message: err.message });
  }
}

module.exports = {
  checkoutConfig,
  previewCheckout,
  placeOrder,
  payCheckout,
  confirmCheckout,
  stripeWebhook,
};

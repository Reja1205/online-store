const Stripe = require("stripe");

function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

function getFrontendBaseUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

async function createCheckoutSession({ order, lineItems, customerEmail }) {
  const stripe = getStripe();
  if (!stripe) return null;

  const base = getFrontendBaseUrl();
  const orderId = order._id.toString();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail || undefined,
    client_reference_id: orderId,
    metadata: {
      orderId,
      orderNumber: order.orderNumber,
    },
    line_items: lineItems.map((it) => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(it.price) * 100),
        product_data: {
          name: it.name,
        },
      },
      quantity: it.qty,
    })),
    // Shipping is included as a line item from checkoutService (avoids double charge)
    success_url: `${base}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout?cancelled=1`,
  });

  return session;
}

async function retrieveSession(sessionId) {
  const stripe = getStripe();
  if (!stripe || !sessionId) return null;
  return stripe.checkout.sessions.retrieve(sessionId);
}

async function constructWebhookEvent(rawBody, signature) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) return null;
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

module.exports = {
  isStripeEnabled,
  getStripe,
  createCheckoutSession,
  retrieveSession,
  constructWebhookEvent,
};

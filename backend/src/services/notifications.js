const { sendEmail, emailLayout, STORE_NAME, isEmailConfigured } = require("./mailer");

function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
  );
}

function formatAddress(addr) {
  if (!addr) return "";
  const lines = [
    addr.fullName,
    addr.address1,
    addr.address2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
    addr.phone ? `Phone: ${addr.phone}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

function buildOrderEmailHtml(order) {
  const itemsHtml = (order.items || [])
    .map(
      (it) =>
        `<tr><td style="padding:8px 0">${it.name}${it.color || it.size ? ` (${[it.color, it.size].filter(Boolean).join(" / ")})` : ""}</td>` +
        `<td style="padding:8px 0;text-align:center">${it.qty}</td>` +
        `<td style="padding:8px 0;text-align:right">$${Number(it.lineTotal).toFixed(2)}</td></tr>`
    )
    .join("");

  return emailLayout({
    title: "Thank you for your order!",
    bodyHtml: `
      <p>Hi ${order.shippingAddress?.fullName || "there"},</p>
      <p>We received your order <strong>${order.orderNumber}</strong> and it is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead><tr style="border-bottom:1px solid #e2e8f0">
          <th align="left">Item</th><th>Qty</th><th align="right">Total</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Items:</strong> $${Number(order.itemsTotal).toFixed(2)}<br/>
      <strong>Shipping:</strong> $${Number(order.shippingFee).toFixed(2)}<br/>
      <strong>Total paid:</strong> $${Number(order.totalUSD).toFixed(2)}</p>
      <p><strong>Ship to:</strong><br/><pre style="font-family:inherit;white-space:pre-wrap">${formatAddress(order.shippingAddress)}</pre></p>
    `,
  });
}

function getAdminNotifyEmail() {
  return (
    process.env.ADMIN_ORDER_EMAIL?.trim() ||
    process.env.ADMIN_ALERT_EMAIL?.trim() ||
    ""
  );
}

function buildAdminOrderEmailHtml(order) {
  const itemsHtml = (order.items || [])
    .map(
      (it) =>
        `<tr><td style="padding:6px 0">${it.name}</td>` +
        `<td style="padding:6px 0;text-align:center">${it.qty}</td>` +
        `<td style="padding:6px 0;text-align:right">$${Number(it.lineTotal).toFixed(2)}</td></tr>`
    )
    .join("");

  const customer = order.shippingAddress?.email || order.user?.email || "—";

  return emailLayout({
    title: "New order received",
    bodyHtml: `
      <p>A new order was placed on your store.</p>
      <p><strong>Order:</strong> ${order.orderNumber}<br/>
      <strong>Total:</strong> $${Number(order.totalUSD).toFixed(2)}<br/>
      <strong>Customer email:</strong> ${customer}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px">
        <thead><tr style="border-bottom:1px solid #e2e8f0">
          <th align="left">Item</th><th>Qty</th><th align="right">Line total</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Ship to:</strong><br/><pre style="font-family:inherit;white-space:pre-wrap;font-size:13px">${formatAddress(order.shippingAddress)}</pre></p>
      <p style="color:#64748b;font-size:13px">Manage this order in your admin dashboard.</p>
    `,
  });
}

async function sendAdminOrderNotificationEmail(order) {
  const to = getAdminNotifyEmail();
  if (!to) {
    return { sent: false, reason: "admin_order_email_not_set" };
  }

  const subject = `${STORE_NAME} — New order ${order.orderNumber}`;
  const html = buildAdminOrderEmailHtml(order);
  const text = `New order ${order.orderNumber} — $${Number(order.totalUSD).toFixed(2)} from ${order.shippingAddress?.email || "customer"}.`;

  return sendEmail({ to, subject, html, text });
}

async function sendOrderConfirmationEmail(order) {
  const to = order.shippingAddress?.email;
  if (!to) return { sent: false, reason: "no_email" };

  const subject = `${STORE_NAME} — Order ${order.orderNumber} confirmed`;
  const html = buildOrderEmailHtml(order);
  const text = `Your order ${order.orderNumber} is confirmed. Total: $${Number(order.totalUSD).toFixed(2)}.`;

  return sendEmail({ to, subject, html, text });
}

function normalizePhoneE164(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (String(phone).trim().startsWith("+")) return String(phone).trim();
  return `+${digits}`;
}

async function sendOrderConfirmationSms(order) {
  const phone = normalizePhoneE164(order.shippingAddress?.phone);
  if (!phone || !isSmsConfigured()) {
    if (process.env.NODE_ENV === "development" && phone) {
      console.log(
        `[NOTIFY] SMS (dev — Twilio not configured): ${phone} — Order ${order.orderNumber} confirmed`
      );
    }
    return { sent: false, reason: "sms_not_configured" };
  }

  const twilio = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await twilio.messages.create({
    body: `${STORE_NAME}: Order ${order.orderNumber} confirmed. Total $${Number(order.totalUSD).toFixed(2)}. Thank you!`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
  });

  return { sent: true };
}

async function sendOrderNotifications(order) {
  const results = { email: null, sms: null, adminEmail: null };
  try {
    results.email = await sendOrderConfirmationEmail(order);
  } catch (err) {
    console.error("ORDER_EMAIL_ERROR:", err);
    results.email = { sent: false, error: err.message };
  }
  try {
    results.adminEmail = await sendAdminOrderNotificationEmail(order);
  } catch (err) {
    console.error("ADMIN_ORDER_EMAIL_ERROR:", err);
    results.adminEmail = { sent: false, error: err.message };
  }
  try {
    results.sms = await sendOrderConfirmationSms(order);
  } catch (err) {
    console.error("ORDER_SMS_ERROR:", err);
    results.sms = { sent: false, error: err.message };
  }
  return results;
}

module.exports = {
  sendOrderNotifications,
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendOrderConfirmationSms,
  isEmailConfigured,
  isSmsConfigured,
  getAdminNotifyEmail,
};

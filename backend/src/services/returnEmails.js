const { sendEmail, emailLayout, STORE_NAME } = require("./mailer");
const { RETURN_SHIPPING_NOTICE } = require("../constants/returnPolicy");

function frontendBase() {
  return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function returnAdminEmail() {
  return (
    process.env.ADMIN_ORDER_EMAIL?.trim() ||
    process.env.ADMIN_ALERT_EMAIL?.trim() ||
    ""
  );
}

async function sendReturnSubmittedEmails(returnReq, order, user) {
  const customerEmail = order.shippingAddress?.email || user?.email;
  const resolutionLabel =
    returnReq.resolution === "replacement" ? "Replacement item" : "Full refund";

  if (customerEmail) {
    const html = emailLayout({
      title: "Return request received",
      bodyHtml: `
        <p>Hi ${user?.name || "there"},</p>
        <p>We received your return request <strong>${returnReq.returnNumber}</strong> for order <strong>${returnReq.orderNumber}</strong>.</p>
        <p><strong>Requested resolution:</strong> ${resolutionLabel}</p>
        <p><strong>Reason:</strong> ${returnReq.reason}</p>
        <p style="color:#64748b;font-size:13px">Status: Pending review. We will email you when it is approved or if we need more information.</p>
        <p style="color:#64748b;font-size:13px">${RETURN_SHIPPING_NOTICE}</p>
      `,
      ctaHref: `${frontendBase()}/orders`,
      ctaLabel: "View my orders",
    });

    await sendEmail({
      to: customerEmail,
      subject: `${STORE_NAME} — Return request ${returnReq.returnNumber}`,
      html,
      text: `Return ${returnReq.returnNumber} submitted for order ${returnReq.orderNumber}.`,
    }).catch((err) => console.error("RETURN_SUBMIT_EMAIL_ERROR:", err));
  }

  const adminTo = returnAdminEmail();
  if (adminTo) {
    const html = emailLayout({
      title: "New return request",
      bodyHtml: `
        <p>A customer submitted a return request.</p>
        <p><strong>Return:</strong> ${returnReq.returnNumber}<br/>
        <strong>Order:</strong> ${returnReq.orderNumber}<br/>
        <strong>Resolution:</strong> ${resolutionLabel}<br/>
        <strong>Reason:</strong> ${returnReq.reason}</p>
      `,
      ctaHref: `${frontendBase()}/admin/returns`,
      ctaLabel: "Review returns",
    });

    await sendEmail({
      to: adminTo,
      subject: `${STORE_NAME} — New return ${returnReq.returnNumber}`,
      html,
      text: `New return ${returnReq.returnNumber} for order ${returnReq.orderNumber}.`,
    }).catch((err) => console.error("RETURN_ADMIN_EMAIL_ERROR:", err));
  }
}

async function sendReturnStatusEmail(returnReq, user, order) {
  const to = order?.shippingAddress?.email || user?.email;
  if (!to) return;

  const base = `${frontendBase()}/orders`;
  let title = "Return update";
  let body = `<p>Your return <strong>${returnReq.returnNumber}</strong> status is now <strong>${returnReq.status}</strong>.</p>`;

  if (returnReq.status === "approved") {
    title = "Return approved — ship your item back";
    body = `
      <p>Your return <strong>${returnReq.returnNumber}</strong> for order <strong>${returnReq.orderNumber}</strong> was approved.</p>
      <p><strong>Resolution:</strong> ${returnReq.resolution === "replacement" ? "We will send a replacement after we receive your return." : "Full refund after we receive and inspect your return."}</p>
      <p style="font-weight:600;color:#b45309">${RETURN_SHIPPING_NOTICE}</p>
      <p>Pack items securely and include your return number on the package.</p>
      ${returnReq.adminNotes ? `<p><strong>Note from our team:</strong> ${returnReq.adminNotes}</p>` : ""}
    `;
  } else if (returnReq.status === "rejected") {
    title = "Return request not approved";
    body = `
      <p>We could not approve return <strong>${returnReq.returnNumber}</strong> at this time.</p>
      ${returnReq.adminNotes ? `<p><strong>Reason:</strong> ${returnReq.adminNotes}</p>` : "<p>Contact us if you have questions.</p>"}
    `;
  } else if (returnReq.status === "completed") {
    title = "Return completed";
    body = `
      <p>Your return <strong>${returnReq.returnNumber}</strong> is complete.</p>
      <p><strong>Resolution:</strong> ${returnReq.resolution === "replacement" ? "Replacement processed." : "Refund processed."}</p>
      ${returnReq.adminNotes ? `<p>${returnReq.adminNotes}</p>` : ""}
    `;
  }

  const html = emailLayout({
    title,
    bodyHtml: body,
    ctaHref: base,
    ctaLabel: "View orders",
  });

  await sendEmail({
    to,
    subject: `${STORE_NAME} — Return ${returnReq.returnNumber} — ${returnReq.status}`,
    html,
    text: `Return ${returnReq.returnNumber} is now ${returnReq.status}.`,
  });
}

module.exports = {
  sendReturnSubmittedEmails,
  sendReturnStatusEmail,
};

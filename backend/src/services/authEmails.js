const { sendEmail, emailLayout, STORE_NAME } = require("./mailer");

function frontendBase() {
  return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
}

async function sendVerificationEmail(user, rawToken) {
  const link = `${frontendBase()}/verify-email?token=${encodeURIComponent(rawToken)}`;
  const html = emailLayout({
    title: "Verify your email",
    bodyHtml: `
      <p>Hi ${user.name},</p>
      <p>Thanks for joining ${STORE_NAME}. Please confirm your email address to activate your account.</p>
      <p style="color:#64748b;font-size:13px">This link expires in 24 hours.</p>
    `,
    ctaHref: link,
    ctaLabel: "Verify email",
  });

  return sendEmail({
    to: user.email,
    subject: `${STORE_NAME} — Verify your email`,
    html,
    text: `Verify your email: ${link}`,
  });
}

async function sendLoginNotificationEmail(user, meta) {
  const when = meta.at ? new Date(meta.at).toLocaleString() : new Date().toLocaleString();
  const html = emailLayout({
    title: "New sign-in to your account",
    bodyHtml: `
      <p>Hi ${user.name},</p>
      <p>Your ${STORE_NAME} account was just signed in.</p>
      <table style="width:100%;margin:16px 0;font-size:14px;color:#475569">
        <tr><td style="padding:4px 0"><strong>Time</strong></td><td>${when}</td></tr>
        <tr><td style="padding:4px 0"><strong>Device</strong></td><td>${meta.device || "Unknown"}</td></tr>
        <tr><td style="padding:4px 0"><strong>IP</strong></td><td>${meta.ip || "Unknown"}</td></tr>
      </table>
      <p style="color:#b45309;font-weight:600">If this wasn't you, secure your account immediately — reset your password and sign out of all devices from your profile.</p>
    `,
    ctaHref: `${frontendBase()}/forgot-password`,
    ctaLabel: "Reset password",
  });

  return sendEmail({
    to: user.email,
    subject: `${STORE_NAME} — New sign-in detected`,
    html,
    text: `New sign-in at ${when} from ${meta.device}. If this wasn't you, reset your password.`,
  });
}

async function sendPasswordResetEmail(user, rawToken) {
  const link = `${frontendBase()}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const html = emailLayout({
    title: "Reset your password",
    bodyHtml: `
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click below to choose a new one.</p>
      <p style="color:#64748b;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
    ctaHref: link,
    ctaLabel: "Reset password",
  });

  return sendEmail({
    to: user.email,
    subject: `${STORE_NAME} — Reset your password`,
    html,
    text: `Reset password: ${link}`,
  });
}

async function sendAdminSecurityAlert(user, meta) {
  const html = emailLayout({
    title: "Admin account activity",
    bodyHtml: `
      <p>Admin sign-in for <strong>${user.email}</strong></p>
      <p>Time: ${meta.at ? new Date(meta.at).toLocaleString() : "now"}<br/>
      IP: ${meta.ip || "unknown"}<br/>
      Device: ${meta.device || "unknown"}</p>
    `,
  });

  const alertTo = process.env.ADMIN_ALERT_EMAIL || user.email;
  return sendEmail({
    to: alertTo,
    subject: `${STORE_NAME} — Admin login alert`,
    html,
    text: `Admin login for ${user.email}`,
  });
}

module.exports = {
  sendVerificationEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
  sendAdminSecurityAlert,
};

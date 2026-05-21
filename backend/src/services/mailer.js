const nodemailer = require("nodemailer");

const STORE_NAME = process.env.STORE_NAME || "Western Culture";
const STORE_EMAIL = process.env.STORE_EMAIL_FROM || process.env.SMTP_USER || "noreply@store.local";

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function normalizeSmtpPass(pass) {
  return String(pass || "").replace(/\s+/g, "");
}

function smtpAuth() {
  return {
    user: String(process.env.SMTP_USER || "").trim(),
    pass: normalizeSmtpPass(process.env.SMTP_PASS),
  };
}

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_SEND_TIMEOUT_MS || 15000);

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

/** Gmail on Render: use 465 first in production (587 often times out). */
function getSmtpAttempts() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const auth = smtpAuth();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const isGmail = host.includes("gmail");
  const isProd = process.env.NODE_ENV === "production";

  if (isGmail && isProd) {
    const attempts = [
      { host, port: 465, secure: true, auth },
      { host, port: 587, secure: false, auth },
    ];
    if (port === 587 && secure === false) return attempts;
    return [
      { host, port, secure, auth },
      ...attempts.filter((a) => a.port !== port),
    ];
  }

  const attempts = [{ host, port, secure, auth }];
  if (isGmail) {
    if (port !== 465) attempts.push({ host, port: 465, secure: true, auth });
    if (port !== 587) attempts.push({ host, port: 587, secure: false, auth });
  }
  return attempts;
}

function createMailer(config) {
  return nodemailer.createTransport({
    ...config,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });
}

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { sent: false, reason: "no_recipient" };

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[MAIL] (dev — SMTP not configured):", { to, subject });
    }
    return { sent: false, reason: "smtp_not_configured" };
  }

  const mail = {
    from: `"${STORE_NAME}" <${STORE_EMAIL}>`,
    to,
    subject,
    text: text || subject,
    html,
  };

  let lastReason = "send_failed";

  for (const cfg of getSmtpAttempts()) {
    const transporter = createMailer(cfg);
    try {
      await withTimeout(
        transporter.sendMail(mail),
        SMTP_TIMEOUT_MS,
        `SMTP send (port ${cfg.port})`
      );
      if (cfg.port !== Number(process.env.SMTP_PORT || 587)) {
        console.log(`[MAIL] sent via fallback port ${cfg.port}`);
      }
      return { sent: true };
    } catch (err) {
      lastReason = err.message || "send_failed";
      console.error(`SEND_EMAIL_ERROR port ${cfg.port}:`, err.message);
      try {
        transporter.close();
      } catch {
        /* ignore */
      }
    }
  }

  return { sent: false, reason: lastReason };
}

function emailLayout({ title, bodyHtml, ctaHref, ctaLabel }) {
  const cta =
    ctaHref && ctaLabel
      ? `<p style="margin:24px 0"><a href="${ctaHref}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600">${ctaLabel}</a></p>`
      : "";

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#4f46e5;letter-spacing:.05em;text-transform:uppercase">${STORE_NAME}</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">${title}</h1>
    <div style="color:#334155;font-size:15px;line-height:1.6">${bodyHtml}</div>
    ${cta}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
    <p style="margin:0;font-size:12px;color:#94a3b8">If you did not request this, you can ignore this email.</p>
  </div>
</body>
</html>`;
}

module.exports = {
  STORE_NAME,
  STORE_EMAIL,
  isEmailConfigured,
  getSmtpAttempts,
  createMailer,
  sendEmail,
  emailLayout,
};

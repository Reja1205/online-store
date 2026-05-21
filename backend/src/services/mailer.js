const nodemailer = require("nodemailer");

const STORE_NAME = process.env.STORE_NAME || "BigBag";
const STORE_EMAIL = process.env.STORE_EMAIL_FROM || process.env.SMTP_USER || "noreply@store.local";

function isEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );
}

function usesResend() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** When set, Resend test mode only delivers to this address (onboarding@resend.dev). */
function getResendTestRecipient() {
  return String(process.env.RESEND_TEST_RECIPIENT || "").toLowerCase().trim();
}

function checkResendRecipient(email) {
  if (!usesResend() || !getResendTestRecipient()) {
    return { ok: true };
  }
  const clean = String(email || "").toLowerCase().trim();
  if (clean === getResendTestRecipient()) return { ok: true };
  return {
    ok: false,
    message: `During testing, please sign up with ${getResendTestRecipient()} only. To allow any customer email, verify your domain at https://resend.com/domains and remove RESEND_TEST_RECIPIENT on the server.`,
  };
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

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_SEND_TIMEOUT_MS || 12000);

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

/** Render + Gmail: never use 587 in production (it times out). */
function getSmtpAttempts() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const auth = smtpAuth();
  const isGmail = host.includes("gmail");
  const isProd = process.env.NODE_ENV === "production";

  if (isGmail && isProd) {
    return [{ host, port: 465, secure: true, auth }];
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const attempts = [{ host, port, secure, auth }];
  if (isGmail && port !== 465) {
    attempts.push({ host, port: 465, secure: true, auth });
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

async function sendViaResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.STORE_EMAIL_FROM?.trim() ||
    "onboarding@resend.dev";

  const res = await withTimeout(
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text: text || subject,
      }),
    }),
    SMTP_TIMEOUT_MS,
    "Resend API"
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `Resend HTTP ${res.status}`;
    return { sent: false, reason: msg };
  }
  return { sent: true, provider: "resend" };
}

async function sendViaSmtp({ to, subject, html, text }) {
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
      return { sent: true, provider: "smtp", port: cfg.port };
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

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { sent: false, reason: "no_recipient" };

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[MAIL] (dev — not configured):", { to, subject });
    }
    return { sent: false, reason: "smtp_not_configured" };
  }

  if (usesResend()) {
    try {
      const resendResult = await sendViaResend({ to, subject, html, text });
      if (resendResult?.sent) return resendResult;
      console.error("RESEND_FAILED:", resendResult?.reason);
      if (process.env.EMAIL_PROVIDER !== "resend") {
        return sendViaSmtp({ to, subject, html, text });
      }
      return resendResult || { sent: false, reason: "resend_failed" };
    } catch (err) {
      console.error("RESEND_ERROR:", err.message);
      if (process.env.EMAIL_PROVIDER === "resend") {
        return { sent: false, reason: err.message };
      }
    }
  }

  return sendViaSmtp({ to, subject, html, text });
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

function getEmailStatus() {
  return {
    configured: isEmailConfigured(),
    provider: usesResend() ? "resend" : "smtp",
    resend: usesResend(),
    smtpPort: process.env.SMTP_PORT || null,
    smtpSecure: process.env.SMTP_SECURE || null,
    productionSmtpPorts: getSmtpAttempts().map((a) => a.port),
  };
}

module.exports = {
  STORE_NAME,
  STORE_EMAIL,
  isEmailConfigured,
  usesResend,
  getResendTestRecipient,
  checkResendRecipient,
  getSmtpAttempts,
  getEmailStatus,
  createMailer,
  sendEmail,
  emailLayout,
};

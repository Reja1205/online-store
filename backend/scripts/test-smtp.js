/**
 * Test SMTP — run from backend folder:
 *   node scripts/test-smtp.js your-email@gmail.com
 */
require("dotenv").config();

const { sendEmail, isEmailConfigured, emailLayout } = require("../src/services/mailer");

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Usage: node scripts/test-smtp.js YOUR_EMAIL@gmail.com");
    process.exit(1);
  }

  if (!isEmailConfigured()) {
    console.error("\n❌ SMTP not configured. Add these to backend/.env:\n");
    console.error("  SMTP_HOST=smtp.gmail.com");
    console.error("  SMTP_PORT=587");
    console.error("  SMTP_USER=your@gmail.com");
    console.error("  SMTP_PASS=your-gmail-app-password");
    console.error("  STORE_EMAIL_FROM=your@gmail.com\n");
    process.exit(1);
  }

  console.log("Sending test email to", to, "...");

  const html = emailLayout({
    title: "SMTP test — Western Culture",
    bodyHtml: "<p>If you received this, email is working. You can enable verification emails next.</p>",
  });

  const result = await sendEmail({
    to,
    subject: "Western Culture — SMTP test",
    html,
    text: "SMTP test OK",
  });

  if (result.sent) {
    console.log("✅ Email sent! Check your inbox (and spam folder).");
  } else {
    console.error("❌ Failed:", result.reason || result);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

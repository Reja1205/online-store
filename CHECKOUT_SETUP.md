# Checkout setup: Stripe, email & SMS

Your store already supports the full checkout flow. **Without extra keys**, checkout runs in **demo mode** (instant “Place order”, no real card).

Add the variables below to **`backend/.env`** (local) and **Render → Environment** (production). Restart the backend after changes.

---

## Quick reference

| Feature | Env vars | Test |
|--------|----------|------|
| **Demo checkout** | *(none)* | Place order on checkout page |
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL` | Pay with card `4242 4242 4242 4242` |
| **Email** | `SMTP_*`, `STORE_EMAIL_FROM` | Order confirmation to customer email |
| **SMS** | `TWILIO_*` | Text to phone on shipping address |

Check status: `GET https://YOUR-API/health` → `checkout` object, or `GET /api/checkout/config`.

---

## 1. Stripe (real card payments)

### A. Create Stripe keys

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → API keys**
2. Copy **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

### B. Backend `.env`

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
FRONTEND_URL=http://localhost:3000
```

Production: set `FRONTEND_URL` to your Vercel URL, e.g. `https://your-store.vercel.app`.

### C. Frontend `.env.local`

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

*(Optional for display; checkout redirect uses the secret key on the server.)*

### D. Webhook (required for stock + cart clear + email/SMS after pay)

**Production (Render)** — full guide: [docs/PRODUCTION_STRIPE_WEBHOOK.md](./docs/PRODUCTION_STRIPE_WEBHOOK.md)

1. Stripe → **Developers → Webhooks → Add endpoint**
2. URL: `https://online-store-7kh8.onrender.com/api/checkout/webhook` (your Render URL if different)
3. Events: `checkout.session.completed`
4. Copy **Signing secret** from Dashboard → `STRIPE_WEBHOOK_SECRET` on Render (not the `stripe listen` secret)

**Local development**

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:4000/api/checkout/webhook
```

Copy the `whsec_...` from the CLI output into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

### E. Test Stripe checkout

1. Restart backend + frontend
2. `GET http://localhost:4000/health` → `"paymentMode": "stripe"`
3. Add to cart → Checkout → fill address → **Pay with Stripe**
4. Test card: `4242 4242 4242 4242`, any future expiry, any CVC
5. You should land on **Order confirmed** with order number; cart empty; stock reduced

If payment succeeds but order stays “pending”, the webhook is not reaching your server — fix webhook URL/secret.

---

## 2. Email confirmations (SMTP)

Works for **demo** and **Stripe** orders after payment completes.

### Gmail example

1. Google Account → Security → **2-Step Verification** ON
2. **App passwords** → create “Mail” → copy 16-character password

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
STORE_EMAIL_FROM=your@gmail.com
STORE_NAME=BigBag
```

### Other providers

| Provider | SMTP_HOST | Port |
|----------|-----------|------|
| Gmail | smtp.gmail.com | 587 |
| Outlook | smtp.office365.com | 587 |
| SendGrid | smtp.sendgrid.net | 587 (user: `apikey`) |

Customer must enter a valid **email** on the checkout shipping form.

---

## 3. SMS confirmations (Twilio)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_FROM_NUMBER=+1234567890
```

1. [Twilio Console](https://console.twilio.com) → get SID, Auth Token, buy a phone number
2. Trial accounts: verify the recipient phone number in Twilio first
3. Use a **US 10-digit** phone on checkout (stored as `+1...`)

SMS sends after order is **paid** (same time as email).

---

## 4. Full local `.env` example

```env
# ... existing MONGO_URI, JWT, Cloudinary ...

FRONTEND_URL=http://localhost:3000
STORE_NAME=BigBag

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=app-password
STORE_EMAIL_FROM=you@gmail.com

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

---

## 5. Production (Render + Vercel)

Add the same variables on **Render** (backend). On **Vercel** (frontend):

- `NEXT_PUBLIC_API_URL` = your Render API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` or `pk_test_...`

Stripe webhook endpoint must use the **Render** URL, not localhost.

---

## 6. Flow summary

```
Cart → Checkout (address + shipping)
  → Place order
      ├─ No Stripe key → mock pay → confirm immediately
      └─ Stripe key → redirect to Stripe Checkout
            → success → /checkout/confirmation?session_id=...
            → webhook OR confirm API → stock down, cart cleared, email + SMS
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Still says “Demo mode” on checkout | Set `STRIPE_SECRET_KEY`, restart backend |
| Paid on Stripe but order pending | Configure webhook + `STRIPE_WEBHOOK_SECRET` |
| Double shipping charge | Fixed — shipping is one line item only |
| No email | Check SMTP vars; use Gmail app password |
| No SMS | Twilio trial must verify recipient number |
| CORS on checkout | Set `ALLOWED_ORIGINS` to your Vercel URL on Render |

---

## Restart after changes

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev

# Terminal 3 — Stripe webhooks (local only)
stripe listen --forward-to localhost:4000/api/checkout/webhook
```

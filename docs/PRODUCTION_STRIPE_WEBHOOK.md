# Production Stripe webhook (Render + Vercel)

Use this **instead of** `stripe listen` when your store is live on Render and Vercel.

**Your API (from this repo):** `https://online-store-7kh8.onrender.com`  
**Webhook URL to register in Stripe:**

```text
https://online-store-7kh8.onrender.com/api/checkout/webhook
```

Replace the hostname if your Render service has a different name.

---

## Overview

| Environment | Webhook how it works |
|-------------|----------------------|
| **Local** | `stripe listen --forward-to localhost:4000/api/checkout/webhook` |
| **Production** | Stripe sends events directly to Render URL (this guide) |

---

## Part A — Render environment variables

1. Open [Render Dashboard](https://dashboard.render.com).
2. Click your **Web Service** (e.g. `online-store-7kh8` or `online-store-api`).
3. Go to **Environment** → **Add Environment Variable**.

Add or update **all** of these:

| Key | Value | Notes |
|-----|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Same Stripe account as dashboard |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From **Part B** (Stripe Dashboard webhook — **not** from `stripe listen`) |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` | **No trailing slash.** Where customers return after Stripe pay |
| `ALLOWED_ORIGINS` | `https://YOUR-APP.vercel.app` | Same Vercel URL (comma-separate if you have multiple) |
| `STORE_NAME` | `BigBag` | Optional, used in emails |

Keep existing vars: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, etc.

4. Click **Save Changes**.
5. Render will **redeploy** the service (wait until status is **Live**).

---

## Part B — Create webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com).
2. Use **Test mode** (toggle top-right) while testing production deploy with test cards.
3. **Developers** → **Webhooks**.
4. Click **Add endpoint**.

### Endpoint details

| Field | What to enter |
|-------|----------------|
| **Endpoint URL** | `https://online-store-7kh8.onrender.com/api/checkout/webhook` |
| **Description** | `Render production — order paid` |
| **Events** | Click **Select events** → find **Checkout** → check **`checkout.session.completed`** only → Add events |

5. Click **Add endpoint**.

### Copy signing secret

1. Open the webhook you just created.
2. Under **Signing secret**, click **Reveal**.
3. Copy value starting with `whsec_`.
4. Paste into Render as **`STRIPE_WEBHOOK_SECRET`** (Part A).
5. Save on Render and wait for redeploy.

**Important:** Production `whsec_` is **different** from local `stripe listen` `whsec_`. Use the Dashboard secret on Render, not the CLI one.

---

## Part C — Vercel frontend

1. [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**.

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://online-store-7kh8.onrender.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` (matches secret key mode) |

2. **Redeploy** the frontend (Deployments → … → Redeploy).

---

## Part D — Verify production

### 1. Health check

Open in browser:

```text
https://online-store-7kh8.onrender.com/health
```

Look for:

```json
"checkout": {
  "stripe": true,
  "stripeWebhook": true,
  "paymentMode": "stripe"
}
```

If `stripeWebhook: false` → `STRIPE_WEBHOOK_SECRET` missing on Render.

### 2. Test checkout on live site

1. Open your **Vercel** shop URL (not localhost).
2. Add product → Checkout → fill address.
3. Click **Pay with Stripe**.
4. Pay with test card: `4242 4242 4242 4242`.
5. You should return to:  
   `https://YOUR-APP.vercel.app/checkout/confirmation?session_id=...`
6. Page shows **Order confirmed**.

### 3. Confirm webhook fired

1. Stripe Dashboard → **Developers** → **Webhooks** → your endpoint.
2. Tab **Recent deliveries** → should show `checkout.session.completed` with **200** response.

If **failed** or **timeout**:

- Render service asleep (free tier) — retry; consider paid plan for webhooks.
- Wrong URL — must be exactly `/api/checkout/webhook`.
- Wrong `STRIPE_WEBHOOK_SECRET` on Render.

---

## Part E — Test vs Live mode

| Mode | Stripe keys | Cards |
|------|-------------|--------|
| **Test** | `sk_test_`, `pk_test_` | `4242 4242 4242 4242` |
| **Live** | `sk_live_`, `pk_live_` | Real cards, real money |

For live mode:

1. Complete Stripe account activation.
2. Create a **second** webhook endpoint (or switch keys) with **live** signing secret.
3. Update Render env vars with live keys and live `whsec_`.

---

## Part F — Local vs production (do not mix)

| | Local | Production (Render) |
|---|--------|---------------------|
| Webhook | `stripe listen` | Stripe Dashboard endpoint |
| `STRIPE_WEBHOOK_SECRET` | From CLI `whsec_` | From Dashboard `whsec_` |
| `FRONTEND_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |
| Stop using | — | Do **not** run `stripe listen` for production traffic |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Paid but order pending on live site | Webhook not 200; fix Render secret + endpoint URL |
| Redirect after pay goes to localhost | `FRONTEND_URL` on Render still `localhost` — set Vercel URL |
| CORS on live checkout | Set `ALLOWED_ORIGINS` on Render to Vercel URL |
| Webhook 404 | Render root dir must be `backend`; path is `/api/checkout/webhook` |
| Webhook 400 invalid signature | `STRIPE_WEBHOOK_SECRET` mismatch — copy from **this** endpoint in Dashboard |

---

## Checklist

- [ ] Render: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`, `ALLOWED_ORIGINS`
- [ ] Stripe: endpoint `https://online-store-7kh8.onrender.com/api/checkout/webhook`
- [ ] Stripe: event `checkout.session.completed`
- [ ] Vercel: `NEXT_PUBLIC_API_URL` → Render URL
- [ ] `/health` shows `stripeWebhook: true`
- [ ] Live checkout test → Order confirmed
- [ ] Stripe webhook deliveries show **200**

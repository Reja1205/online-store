# Deploy Western Culture Online Store

Deploy **frontend** on [Vercel](https://vercel.com) and **backend** on [Render](https://render.com). MongoDB Atlas and Cloudinary stay as external services.

## Prerequisites

- GitHub repo pushed: `https://github.com/Reja1205/online-store`
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier OK)
- [Cloudinary](https://cloudinary.com) account for product images
- Copy secrets from local `backend/.env` (never commit `.env`)

---

## 1. Deploy backend (Render)

### Option A — Existing service (update)

1. Open [Render Dashboard](https://dashboard.render.com) → your **Web Service** (e.g. `online-store-7kh8`).
2. **Settings → Build & Deploy**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment** — ensure these exist:

   | Variable | Example |
   |----------|---------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Atlas connection string |
   | `JWT_SECRET` | long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
   | `CLOUDINARY_API_KEY` | from Cloudinary |
   | `CLOUDINARY_API_SECRET` | from Cloudinary |
   | `SHIPPING_FEE_USD` | `5.99` |
   | `ALLOWED_ORIGINS` | `https://online-store-six-gules.vercel.app` |

4. **Manual Deploy → Deploy latest commit** (or push to the connected branch).

5. Test: `https://YOUR-SERVICE.onrender.com/health` → `{"status":"OK",...}`

### Option B — New service from Blueprint

1. Render → **New** → **Blueprint**
2. Connect repo `Reja1205/online-store`
3. Use root `render.yaml` in the repo
4. Fill secret env vars when prompted
5. Deploy

**Note:** Free Render services spin down after idle; first request may take ~30s.

---

## 2. Deploy frontend (Vercel)

1. Open [Vercel Dashboard](https://vercel.com) → your project (or **Add New → Project**).
2. Import `Reja1205/online-store` from GitHub.
3. **Configure Project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output:** default (Next.js)

4. **Environment Variables:**

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-SERVICE.onrender.com` (no trailing slash) |
   | `NEXT_PUBLIC_SITE_URL` | `https://YOUR-APP.vercel.app` (optional) |

5. Deploy. Vercel builds on every push to the connected branch.

6. After deploy, add the Vercel URL to Render `ALLOWED_ORIGINS` if you use a custom domain list (`.vercel.app` is already allowed in code).

---

## 3. Push code before deploy

From your machine:

```bash
cd /path/to/online-store
git add -A
git status   # ensure .env files are NOT staged
git commit -m "Prepare production deploy: reviews, wishlist, UI updates"
git push origin admin-dashboard-ui-polish
```

Merge to `main` if Vercel/Render deploy from `main`:

```bash
git checkout main
git pull origin main
git merge admin-dashboard-ui-polish
git push origin main
```

---

## 4. Post-deploy checklist

- [ ] `https://YOUR-API.onrender.com/health` returns OK
- [ ] Vercel site loads products on home / catalog
- [ ] Login / register works
- [ ] Admin can edit products (use admin account)
- [ ] Add to cart + checkout
- [ ] Product images load (Cloudinary URLs)
- [ ] **Checkout** — see [CHECKOUT_SETUP.md](./CHECKOUT_SETUP.md) for Stripe, email (SMTP), SMS (Twilio)

### Checkout env vars (Render)

| Variable | Purpose |
|----------|---------|
| `FRONTEND_URL` | Vercel site URL (Stripe return URLs) |
| `STRIPE_SECRET_KEY` | Real payments (omit for demo mode) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard webhook (production) — **not** `stripe listen` |
| `SMTP_*` + `STORE_EMAIL_FROM` | Order confirmation email |
| `TWILIO_*` | Order confirmation SMS |

### Production Stripe webhook (step-by-step)

Full guide: **[docs/PRODUCTION_STRIPE_WEBHOOK.md](./docs/PRODUCTION_STRIPE_WEBHOOK.md)**

1. **Stripe Dashboard** → Developers → Webhooks → **Add endpoint**
2. URL: `https://online-store-7kh8.onrender.com/api/checkout/webhook` (use your Render URL if different)
3. Event: **`checkout.session.completed`**
4. Copy signing secret `whsec_...` → Render env **`STRIPE_WEBHOOK_SECRET`**
5. Render: set **`FRONTEND_URL`** = your Vercel URL (e.g. `https://online-store-six-gules.vercel.app`)
6. Render: set **`STRIPE_SECRET_KEY`** = `sk_test_...` (or `sk_live_...` for real money)
7. Redeploy Render + Vercel
8. Test: `https://online-store-7kh8.onrender.com/health` → `"stripeWebhook": true`
9. Checkout on live Vercel site with card `4242 4242 4242 4242`

---

## 5. Custom domain (optional)

- **Vercel:** Project → Settings → Domains
- **Render:** Service → Settings → Custom Domain
- Update `ALLOWED_ORIGINS` on Render with the final HTTPS frontend URL

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS blocked | Set `ALLOWED_ORIGINS` on Render to exact Vercel URL; redeploy API |
| Network error on shop | `NEXT_PUBLIC_API_URL` wrong or missing on Vercel; redeploy frontend |
| API slow first load | Render free tier cold start — wait or upgrade |
| Images broken | Check Cloudinary env vars on Render |
| 401 on cart | Sign in again; check `JWT_SECRET` unchanged between deploys |

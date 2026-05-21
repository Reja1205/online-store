# Email + deploy — simple steps

## Part A — Turn on emails (Gmail)

### 1. Get a Gmail App Password

1. Open https://myaccount.google.com/security  
2. Turn on **2-Step Verification** (if off).  
3. Search **App passwords** → create one for **Mail**.  
4. Copy the 16-character password (no spaces).

### Render: use Resend (recommended — Gmail often fails on Render)

1. Sign up at https://resend.com (free tier).
2. Create an API key.
3. On Render, add:
   ```bash
   RESEND_API_KEY=re_your_key_here
   RESEND_FROM=onboarding@resend.dev
   EMAIL_PROVIDER=resend
   ```
4. Save → **Manual Deploy** → wait for **Live**.
5. Register or **Resend verification** on your live site.

Gmail SMTP on Render frequently times out on port 587; port 465 may still fail.

**Resend test limit:** With `onboarding@resend.dev`, you can only send to the **same Gmail you used to sign up for Resend** until you [verify a domain](https://resend.com/domains). Example error: *"You can only send testing emails to your own email address"*. Fix: register with that email for testing, or verify your store domain and set `RESEND_FROM=BigBag <orders@yourdomain.com>`.

**Order emails (after payment):**
- Customer gets order confirmation (their checkout email).
- Admin gets a **new order** alert if `ADMIN_ORDER_EMAIL` or `ADMIN_ALERT_EMAIL` is set on Render (use `rejaur1989@gmail.com` until domain is verified).

### Render / production Gmail fix

If you see **“account created but verification email failed”** on the live site but local works:

1. Render → Environment → set:
   ```bash
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_PASS=your16charapppassword
   ```
   (`SMTP_PASS` with **no spaces**)
2. Save and redeploy.
3. Open `/verify-email` on your site → **Resend verification** (account already exists).

### 2. Edit `backend/.env`

Add or fill in these lines (use **your** Gmail):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=paste-app-password-here
STORE_EMAIL_FROM=your@gmail.com
ADMIN_ALERT_EMAIL=your@gmail.com
```

Keep this for now:

```bash
REQUIRE_EMAIL_VERIFICATION=false
```

### 3. Test email

Restart backend, then run:

```bash
cd backend
node scripts/test-smtp.js your@gmail.com
```

- ✅ “Email sent” → check inbox/spam.  
- ❌ Error → double-check `SMTP_USER` and `SMTP_PASS`.

Or open: http://localhost:4000/health  
Look for `"auth": { "email": true }`.

### 4. Turn on “verify email before login”

Only after the test works, change in `backend/.env`:

```bash
REQUIRE_EMAIL_VERIFICATION=true
```

Restart backend. New signups must click the link in email before login.

---

## Part B — Put the live site online (Render + Vercel)

Your URLs (from this project):

| Service | URL |
|---------|-----|
| API (Render) | `https://online-store-7kh8.onrender.com` |
| Shop (Vercel) | `https://online-store-six-gules.vercel.app` |

### Render (backend)

Dashboard → your API service → **Environment** → add/update:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://online-store-six-gules.vercel.app` |
| `ALLOWED_ORIGINS` | `https://online-store-six-gules.vercel.app` |
| `REQUIRE_EMAIL_VERIFICATION` | `false` first, then `true` after SMTP works |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your Gmail |
| `SMTP_PASS` | app password |
| `STORE_EMAIL_FROM` | your Gmail |
| Plus | same `JWT_SECRET`, `MONGODB_URI`, Stripe, Cloudinary as local |

Click **Save** → **Manual Deploy**.

### Vercel (frontend)

Project → **Settings** → **Environment Variables**:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://online-store-7kh8.onrender.com` |

Redeploy frontend.

### Check live

1. https://online-store-7kh8.onrender.com/health → `"email": true` when SMTP is set.  
2. Open Vercel shop → register / login / forgot password.

---

## Quick checklist

- [ ] Gmail app password created  
- [ ] SMTP lines in `backend/.env`  
- [ ] `node scripts/test-smtp.js your@gmail.com` works  
- [ ] `REQUIRE_EMAIL_VERIFICATION=true` (optional)  
- [ ] Render env updated + redeployed  
- [ ] Vercel `NEXT_PUBLIC_API_URL` set + redeployed  

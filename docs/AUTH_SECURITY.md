# Authentication & Security Upgrade

Production-grade enhancements layered on the existing JWT + MongoDB auth system. UI routes and admin dashboard layout are preserved.

---

## 1. Security analysis (before upgrade)

| Area | Previous state | Risk |
|------|----------------|------|
| Email verification | None | Unverified accounts could log in |
| Password reset | None | Account recovery only via support |
| Login alerts | None | No visibility into account takeover |
| Brute force | None | Unlimited login attempts |
| JWT revocation | None | Stolen token valid until expiry |
| Admin protection | `role === "admin"` in middleware | Worked on API; UI-only guards on `/admin/*` |
| Token storage | localStorage + optional httpOnly cookie | XSS could read Bearer token |
| Admin signup | Public endpoint + `ADMIN_SECRET` | Secret exposure = full admin access |
| Rate limiting | None | Credential stuffing feasible |
| Audit trail | None | No admin action history |

**What was already solid:** bcrypt hashing, JWT verification middleware, admin API guards on products/orders/users, guest cart merge on login, CORS configuration, password excluded from API responses.

---

## 2. Vulnerabilities addressed

- **Account enumeration (partial):** forgot-password and resend-verification return generic success messages.
- **Brute force:** failed login counter + temporary lockout (`ACCOUNT_LOCK_ATTEMPTS` / `ACCOUNT_LOCK_MINUTES`).
- **Rate limiting:** in-memory limiter on auth endpoints (upgrade to Redis for multi-instance Render).
- **Token reuse after password reset / logout-all:** `tokenVersion` in JWT + DB check in `auth.middleware.js`.
- **Privilege escalation:** role changes validated server-side; last admin cannot be demoted/deleted.
- **Unverified access:** `requireVerified` on wishlist, orders, profile address when `REQUIRE_EMAIL_VERIFICATION=true`.
- **Weak passwords:** policy enforced on register and reset (length + mixed case + digit).

**Remaining recommendations:** CAPTCHA on login/register, Redis rate limits, rotate `JWT_SECRET`, disable public admin registration in production, HttpOnly-only tokens (drop localStorage), 2FA for admins.

---

## 3. Backend changes

### New files

| Path | Purpose |
|------|---------|
| `src/utils/cryptoTokens.js` | Secure random tokens + SHA-256 storage |
| `src/utils/passwordPolicy.js` | Password validation + strength |
| `src/utils/authCookies.js` | HttpOnly cookie helpers |
| `src/utils/requestMeta.js` | IP / user-agent for login history |
| `src/utils/userPublic.js` | Safe user serializer + role helpers |
| `src/utils/migrateUsers.js` | Grandfather legacy users on connect |
| `src/services/mailer.js` | Shared Nodemailer + HTML layout |
| `src/services/authEmails.js` | Verification, login, reset templates |
| `src/services/auth.service.js` | Auth business logic |
| `src/models/AuditLog.js` | Admin audit entries |
| `src/middleware/rateLimit.middleware.js` | Auth rate limits |
| `src/middleware/requireVerified.middleware.js` | Block unverified users |
| `src/middleware/role.middleware.js` | RBAC (`admin`, `superadmin`) |
| `src/middleware/auditLog.middleware.js` | Log successful admin mutations |

### Modified files

| Path | Changes |
|------|---------|
| `src/models/User.js` | Verification, reset, lockout, `tokenVersion`, `loginHistory` |
| `src/controllers/auth.controller.js` | Thin handlers; new endpoints |
| `src/routes/auth.routes.js` | verify, resend, forgot, reset, refresh, logout-all |
| `src/middleware/auth.middleware.js` | Async + `tokenVersion` validation |
| `src/middleware/admin.middleware.js` | `superadmin` support |
| `src/utils/jwt.js` | Access + refresh token signing |
| `src/config/db.js` | Runs `migrateLegacyUsers()` |
| `src/services/notifications.js` | Uses shared `mailer.js` |
| `src/routes/wishlist.routes.js` | `requireVerified` |
| `src/routes/order.routes.js` | `requireVerified` + audit on status update |
| `.env.example` | New auth env vars |

### API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register-user` | Public | Creates user; sends verification if enabled |
| POST | `/api/auth/register-admin` | Public + secret | Admin account (verified immediately) |
| POST | `/api/auth/login` | Public | Login + cookies + login email |
| POST | `/api/auth/logout` | Public | Clear cookies |
| POST | `/api/auth/logout-all` | Bearer | Revoke all sessions (`tokenVersion++`) |
| POST | `/api/auth/refresh` | Refresh cookie | New access token |
| GET/POST | `/api/auth/verify-email` | Public | Confirm email token |
| POST | `/api/auth/resend-verification` | Public | Resend verify email |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password` | Public | Set new password + revoke tokens |
| GET | `/api/auth/me` | Bearer | Current user |
| PUT | `/api/auth/address` | Bearer + verified | Save shipping address |

---

## 4. Frontend changes

| Path | Changes |
|------|---------|
| `app/login/page.jsx` | Remember me, forgot password, verification hint |
| `app/register/page.jsx` | Password strength, policy validation |
| `app/forgot-password/page.jsx` | **New** |
| `app/reset-password/page.jsx` | **New** |
| `app/verify-email/page.jsx` | **New** |
| `app/profile/page.jsx` | Verification banner, resend, sign out all devices |
| `app/context/AuthContext.jsx` | `logoutAllDevices()` |
| `app/lib/password.js` | Client strength helper |
| `app/components/auth/PasswordStrength.jsx` | **New** |

Existing admin pages still gate with `/api/auth/me` + `role === "admin"` (works for `superadmin` if checks updated to `isAdmin` pattern).

---

## 5. Updated MongoDB schema (`User`)

```javascript
emailVerified, emailVerifiedAt
verificationToken, verificationTokenExpires  // stored hashed
resetPasswordToken, resetPasswordExpires    // stored hashed
lastLogin, loginHistory[]
failedLoginAttempts, accountLockedUntil
tokenVersion, refreshTokenHash
role: "user" | "admin" | "superadmin"
```

Indexes: `role`, `emailVerified`, sparse on token fields.

---

## 6. Auth middleware flow

```
Request → Bearer or cookie token
       → jwt.verify(JWT_SECRET)
       → if payload.tv defined: load user.tokenVersion from DB
       → mismatch → 401 Session expired
       → req.user = { id, role, emailVerified }
       → optional requireVerified / requireAdmin / requireRole
```

---

## 7. Admin authorization

- **API (enforced):** `requireAuth` → `requireAdmin` (accepts `admin` and `superadmin`).
- **Optional:** `requireSuperAdmin` for destructive platform settings (future).
- **User management:** cannot demote/delete self; cannot remove last admin.
- **Audit:** order status updates logged to `AuditLog` collection.

Frontend `/admin/*` still redirects non-admins client-side; security does not rely on this.

---

## 8. Email templates

Located in `src/services/authEmails.js` using `mailer.emailLayout()`:

- Email verification (CTA link to `/verify-email?token=…`)
- Login notification (time, device, IP + security warning)
- Password reset (1-hour link to `/reset-password?token=…`)
- Admin security alert (to `ADMIN_ALERT_EMAIL`)

Order confirmation emails remain in `notifications.js` (shared mailer).

---

## 9. Environment variables

```bash
# Required
JWT_SECRET=<long-random-string>

# Recommended production
REQUIRE_EMAIL_VERIFICATION=true
SMTP_HOST= SMTP_USER= SMTP_PASS=
FRONTEND_URL=https://your-store.vercel.app
ADMIN_SECRET=<strong-secret>   # disable register-admin UI in prod if possible
ADMIN_ALERT_EMAIL=security@yourstore.com

# Optional tuning
JWT_EXPIRES_IN=7d
JWT_REMEMBER_EXPIRES_IN=30d
JWT_REFRESH_EXPIRES_IN=7d
ACCOUNT_LOCK_ATTEMPTS=5
ACCOUNT_LOCK_MINUTES=15
RATE_LIMIT_STRICT_MAX=10
```

---

## 10. Deployment checklist

1. Set `JWT_SECRET` on Render (never commit).
2. Configure SMTP on Render; set `REQUIRE_EMAIL_VERIFICATION=true` when ready.
3. Set `FRONTEND_URL` and `ALLOWED_ORIGINS` to Vercel URL.
4. Redeploy **backend first**, then frontend.
5. Existing users are auto-migrated to `emailVerified: true` on DB connect.
6. For production: consider removing admin self-registration from UI and creating admins via script only.

---

## 11. Folder structure (auth-related)

```
backend/src/
  controllers/auth.controller.js
  routes/auth.routes.js
  services/auth.service.js
  services/authEmails.js
  services/mailer.js
  models/User.js
  models/AuditLog.js
  middleware/auth.middleware.js
  middleware/admin.middleware.js
  middleware/requireVerified.middleware.js
  middleware/role.middleware.js
  middleware/rateLimit.middleware.js
  middleware/auditLog.middleware.js
  utils/jwt.js
  utils/cryptoTokens.js
  utils/passwordPolicy.js
  utils/authCookies.js
  utils/requestMeta.js
  utils/userPublic.js
  utils/migrateUsers.js

frontend/app/
  login/ register/ forgot-password/ reset-password/ verify-email/
  context/AuthContext.jsx
  lib/password.js
  components/auth/PasswordStrength.jsx
```

---

## 12. How to enable email verification in production

1. Configure SMTP on Render.
2. Set `REQUIRE_EMAIL_VERIFICATION=true`.
3. Redeploy backend.
4. New signups receive verification email; login blocked until verified.
5. Legacy users remain verified via migration.

---

## 13. Session / logout-all

- JWT payload includes `tv` (tokenVersion).
- `POST /api/auth/logout-all` increments `tokenVersion` and clears refresh hash.
- All older access tokens fail middleware check immediately.

Refresh tokens are stored hashed on the user document and validated on `POST /api/auth/refresh`.

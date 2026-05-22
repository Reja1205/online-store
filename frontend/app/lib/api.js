// frontend/app/lib/api.js

import { getGuestId } from "./guest";

const rawBase =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.trim()
    : "";

/** Base URL for the Express API (no trailing slash). */
export const API = rawBase.replace(/\/+$/, "") || "http://localhost:4000";

function sessionHeaders(extra = {}) {
  if (typeof window === "undefined") return extra;

  const headers = { ...extra };
  const token = localStorage.getItem("token");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const guestId = getGuestId();
    if (guestId) headers["X-Guest-Id"] = guestId;
  }

  return headers;
}

/**
 * Cross-origin credentialed fetches need exact ACAO + `Access-Control-Allow-Credentials: true`.
 * This app uses Bearer tokens from localStorage, so default is `omit` to avoid brittle CORS.
 * Pass `credentials: "include"` when you rely on httpOnly cookies cross-site (e.g. login only).
 */
function shouldLogPerf() {
  return (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "development"
  );
}

function buildFetchInit(options, headers, extra = {}) {
  return {
    ...options,
    headers,
    // Public GET catalog uses browser/CDN cache; authenticated calls stay fresh
    cache: options.cache ?? "no-store",
    credentials: options.credentials ?? "omit",
    ...extra,
  };
}

const networkErrorRes = {
  ok: false,
  status: 0,
  json: async () => ({}),
};

/** User-facing copy only — no env var names (shown in production). */
const NETWORK_ERROR_USER_MESSAGE =
  "We couldn’t reach the store. Check your connection and try again. If this keeps happening, try again in a few minutes.";

function networkFailurePayload() {
  const payload = {
    code: "NETWORK_ERROR",
    message: NETWORK_ERROR_USER_MESSAGE,
  };

  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    let origin = "invalid URL";
    try {
      origin = new URL(API).origin;
    } catch {
      /* keep default */
    }
    payload.debug = `DEV: fetch failed. API base is "${API}" (${origin}). Deployed: set NEXT_PUBLIC_API_URL on the host. Local: run the API (e.g. on port 4000).`;
  }

  return payload;
}

/** True when the request never reached the server (offline, CORS block, bad URL, mixed content, etc.). */
export function isNetworkFailure(res, data) {
  return res?.status === 0 || data?.code === "NETWORK_ERROR";
}

// ✅ JSON requests (GET/POST/PUT/DELETE)
export async function apiJson(path, options = {}) {
  const url = `${API}${path.startsWith("/") ? path : `/${path}`}`;
  const label = options.perfLabel || path;
  const logPerf = shouldLogPerf();
  const started = logPerf && typeof performance !== "undefined" ? performance.now() : 0;

  const timeoutMs = Number(options.timeoutMs || 0);
  const controller = timeoutMs > 0 && typeof AbortController !== "undefined" ? new AbortController() : null;
  let timeoutId = null;
  if (controller && timeoutMs > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const res = await fetch(
      url,
      buildFetchInit(
        options,
        sessionHeaders({
          "Content-Type": "application/json",
          ...(options.headers || {}),
        }),
        controller ? { signal: controller.signal } : {}
      )
    );

    const data = await res.json().catch(() => ({}));

    if (logPerf && started) {
      const ms = performance.now() - started;
      if (ms >= 300 || String(path).includes("/products")) {
        console.log(`[PERF] api ${label} ${res.status} ${ms.toFixed(0)}ms`);
      }
    }

    return { res, data };
  } catch (err) {
    if (logPerf && started) {
      console.log(`[PERF] api ${label} FAILED ${(performance.now() - started).toFixed(0)}ms`);
    }
    const aborted = err?.name === "AbortError";
    return {
      res: networkErrorRes,
      data: aborted
        ? {
            code: "TIMEOUT",
            message:
              "The server is taking too long. Wait a moment and try again, or use resend verification if your account was created.",
          }
        : networkFailurePayload(),
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// ✅ FormData requests (image upload etc.)
// IMPORTANT: do NOT manually set Content-Type for FormData
export async function apiForm(path, formData, options = {}) {
  const url = `${API}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(
      url,
      buildFetchInit(options, sessionHeaders(options.headers || {}), {
        method: options.method || "POST",
        body: formData,
      })
    );

    const data = await res.json().catch(() => ({}));
    return { res, data };
  } catch {
    return {
      res: networkErrorRes,
      data: networkFailurePayload(),
    };
  }
}

// Helpers so UI works with both old/new product shapes
export function productName(p) {
  return p?.name ?? p?.title ?? "";
}

export function productPrice(p) {
  const v = p?.price ?? p?.priceUSD ?? 0;
  return Number(v) || 0;
}

export function productStock(p) {
  const v = p?.stock ?? p?.stockQty ?? 0;
  return Number(v) || 0;
}

export function productSalePrice(p) {
  const sale = Number(p?.salePrice);
  if (!Number.isFinite(sale) || sale < 0) return null;
  return sale;
}

function productManualSalePrice(p) {
  const regular = productPrice(p);
  const sale = productSalePrice(p);
  if (p?.onSale && sale != null && sale < regular) return sale;
  return null;
}

/** Price from promotion % when product is in a campaign. */
export function productPromotionPrice(p) {
  const regular = productPrice(p);
  const percent = Number(p?.promotionPercent);
  const slug = String(p?.promotionCategory || "").trim();
  if (!slug || !Number.isFinite(percent) || percent <= 0 || percent >= 100) return null;
  return Math.round(regular * (100 - percent)) / 100;
}

/** Price shown to shoppers (lowest of regular, manual sale, or promotion). */
export function productDisplayPrice(p) {
  const regular = productPrice(p);
  const candidates = [regular];
  const manual = productManualSalePrice(p);
  const promo = productPromotionPrice(p);
  if (manual != null) candidates.push(manual);
  if (promo != null) candidates.push(promo);
  if (p?.displayPrice != null && Number.isFinite(Number(p.displayPrice))) {
    candidates.push(Number(p.displayPrice));
  }
  return Math.min(...candidates);
}

export function productHasDiscount(p) {
  return productDisplayPrice(p) < productPrice(p) - 0.001;
}

export function productIsOnSale(p) {
  return productHasDiscount(p);
}

/** Label for discount badge (e.g. "20% off"). */
export function productDiscountLabel(p) {
  const regular = productPrice(p);
  const display = productDisplayPrice(p);
  if (display >= regular - 0.001) return "";

  const promoPct = Number(p?.promotionPercent);
  if (String(p?.promotionCategory || "").trim() && Number.isFinite(promoPct) && promoPct > 0) {
    return `${Math.round(promoPct)}% off`;
  }

  const pct = Math.round((1 - display / regular) * 100);
  return pct > 0 ? `${pct}% off` : "Sale";
}

export function formatMoneyUSD(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}
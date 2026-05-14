// frontend/app/lib/api.js

const rawBase =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.trim()
    : "";

/** Base URL for the Express API (no trailing slash). */
export const API = rawBase.replace(/\/+$/, "") || "http://localhost:4000";

function authHeaders(extra = {}) {
  if (typeof window === "undefined") return extra;

  const token = localStorage.getItem("token");

  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : extra;
}

/**
 * Cross-origin credentialed fetches need exact ACAO + `Access-Control-Allow-Credentials: true`.
 * This app uses Bearer tokens from localStorage, so default is `omit` to avoid brittle CORS.
 * Pass `credentials: "include"` when you rely on httpOnly cookies cross-site (e.g. login only).
 */
function buildFetchInit(options, headers, extra = {}) {
  return {
    ...options,
    headers,
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

  try {
    const res = await fetch(
      url,
      buildFetchInit(options, authHeaders({
        "Content-Type": "application/json",
        ...(options.headers || {}),
      }))
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

// ✅ FormData requests (image upload etc.)
// IMPORTANT: do NOT manually set Content-Type for FormData
export async function apiForm(path, formData, options = {}) {
  const url = `${API}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(
      url,
      buildFetchInit(options, authHeaders(options.headers || {}), {
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
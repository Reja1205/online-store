// frontend/app/lib/api.js

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders(extra = {}) {
  if (typeof window === "undefined") return extra;
  const token = localStorage.getItem("token");
  return token ? { ...extra, Authorization: "Bearer " + token } : extra;
}

// ✅ JSON requests (GET/POST/PUT/DELETE)
export async function apiJson(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: authHeaders(options.headers || {}),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// ✅ FormData requests (image upload etc.)
export async function apiForm(path, formData, options = {}) {
  const res = await fetch(API + path, {
    method: options.method || "POST",
    headers: authHeaders(options.headers || {}), // IMPORTANT: don't set Content-Type
    body: formData,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
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
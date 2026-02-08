// frontend/app/lib/api.js

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// ✅ Some files import apiFetch, so we provide it
export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API}${path}`;

  const headers = {
    ...(options.headers || {}),
    ...authHeaders(),
  };

  return fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });
}

// ✅ Most of our code uses apiJson
export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// ✅ Product helpers (used by ProductCard / admin pages)
export function productName(p) {
  return String(p?.name ?? p?.title ?? "");
}

export function productPrice(p) {
  const v = p?.price ?? p?.priceUSD ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function productStock(p) {
  const v = p?.stock ?? p?.stockQty ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
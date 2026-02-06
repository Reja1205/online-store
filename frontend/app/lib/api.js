// frontend/app/lib/api.js

export const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// fetch helper (returns Response)
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...authHeaders(),
    },
    cache: "no-store",
  });
  return res;
}

// json helper (returns parsed JSON or throws)
export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

// product helpers (so UI doesn’t break if fields change)
export const productName = (p) => p?.name ?? p?.title ?? "";
export const productPrice = (p) =>
  p?.price ?? p?.priceUSD ?? "";
export const productStock = (p) =>
  p?.stock ?? p?.stockQty ?? 0;
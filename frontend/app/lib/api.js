export const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: "Bearer " + token } : {};
}

// ✅ generic fetch wrapper (some of your pages import apiFetch)
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...authHeaders(),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// JSON requests
export async function apiJson(path, options = {}) {
  return apiFetch(path, options);
}

// FormData requests (for image upload)
export async function apiForm(path, formData, options = {}) {
  const res = await fetch(`${API}${path}`, {
    method: options.method || "POST",
    headers: {
      ...(options.headers || {}),
      ...authHeaders(),
      // DO NOT set Content-Type for FormData
    },
    body: formData,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// Helpers to normalize product fields
export function productPrice(p) {
  const v = p?.price ?? p?.priceUSD ?? 0;
  return Number(v) || 0;
}
export function productStock(p) {
  const v = p?.stock ?? p?.stockQty ?? 0;
  return Number(v) || 0;
}
export function productName(p) {
  return p?.name ?? p?.title ?? "Product";
}
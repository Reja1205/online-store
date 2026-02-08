// app/lib/auth.js
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: "Bearer " + token } : {};
}

// Client-side "me"
export async function isAuthenticated() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API}/api/auth/me`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => ({}));
  return data?.user || null;
}
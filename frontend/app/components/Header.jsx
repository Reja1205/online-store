














"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function Header({ user: userProp, onLogout: onLogoutProp }) {
  const [user, setUser] = useState(userProp || null);

  // If parent passed user, use it. Otherwise fetch /me.
  useEffect(() => {
    if (userProp !== undefined) {
      setUser(userProp);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, { headers: authHeaders() });
        if (res.status === 401) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data?.user || null);
      } catch {
        setUser(null);
      }
    })();
  }, [userProp]);

  async function logout() {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST", headers: authHeaders() });
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
    if (onLogoutProp) onLogoutProp();
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          Online Store
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/products" className="rounded px-3 py-2 hover:bg-gray-100">
            Products
          </Link>

          {user ? (
            <>
              <Link href="/cart" className="rounded px-3 py-2 hover:bg-gray-100">
                Cart
              </Link>
              <Link href="/orders" className="rounded px-3 py-2 hover:bg-gray-100">
                My Orders
              </Link>
              <Link href="/profile" className="rounded px-3 py-2 hover:bg-gray-100">
                {user.name || "Profile"}
              </Link>

              {user.role === "admin" && (
                <>
                  <Link href="/admin" className="rounded px-3 py-2 hover:bg-gray-100">
                    Admin
                  </Link>
                  <Link href="/admin/orders" className="rounded px-3 py-2 hover:bg-gray-100">
                    Admin Orders
                  </Link>
                </>
              )}

              <button
                onClick={logout}
                className="rounded bg-gray-900 px-3 py-2 text-white hover:bg-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded px-3 py-2 hover:bg-gray-100">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded bg-gray-900 px-3 py-2 text-white hover:bg-black"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}




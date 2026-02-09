"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

export default function Header({ user, onLogout }) {
  const [cartCount, setCartCount] = useState(0);

  async function loadCartCount() {
    if (!user) {
      setCartCount(0);
      return;
    }

    const { res, data } = await apiJson("/api/cart");
    if (!res.ok) {
      setCartCount(0);
      return;
    }

    const items = data?.cart?.items || data?.items || data?.cartItems || [];
    const count = Array.isArray(items)
      ? items.reduce((sum, it) => sum + Number(it.qty || 0), 0)
      : 0;

    setCartCount(count);
  }

  useEffect(() => {
    loadCartCount();

    function onCartUpdated() {
      loadCartCount();
    }

    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <header className="mt-4 rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-px shadow">
      <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white font-bold">
                OS
              </span>

              <div>
                <p className="text-lg font-semibold text-white leading-tight">
                  Online Store
                </p>
                <p className="text-xs text-white/80">Buy with confidence</p>
              </div>
            </div>

            {user ? (
              <p className="mt-2 text-sm text-white/90">
                Hi, <span className="font-semibold">{user.name}</span>
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {user.role}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/90">
                Fast checkout • Secure orders • Simple shopping
              </p>
            )}
          </div>

          {/* Right */}
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
            >
              Products
            </Link>

            {user ? (
              <>
                <Link
                  href="/cart"
                  className="relative rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
                >
                  Cart
                  <span className="ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-white text-gray-900 text-xs font-bold">
                    {cartCount}
                  </span>
                </Link>

                <Link
                  href="/checkout"
                  className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
                >
                  Checkout
                </Link>

                <Link
                  href="/orders"
                  className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
                >
                  My Orders
                </Link>

                <Link
                  href="/profile"
                  className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
                >
                  Profile
                </Link>

                {user.role === "admin" ? (
                  <>
                    <Link
                      href="/admin"
                      className="rounded-xl bg-black/30 px-4 py-2 text-sm font-semibold text-white hover:bg-black/40"
                    >
                      Admin Dashboard
                    </Link>

                    <Link
                      href="/admin/orders"
                      className="rounded-xl bg-black/30 px-4 py-2 text-sm font-semibold text-white hover:bg-black/40"
                    >
                      Admin Orders
                    </Link>
                  </>
                ) : null}

                <button
                  onClick={onLogout}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-black/30 px-4 py-2 text-sm font-semibold text-white hover:bg-black/40"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
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

    // supports: {cart:{items:[...]}} or {items:[...]} or {cartItems:[...]}
    const items =
      data?.cart?.items ||
      data?.items ||
      data?.cartItems ||
      [];

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
    <header className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-bold text-lg text-indigo-700">
          Online Store
        </Link>

        {user ? (
          <span className="text-sm text-gray-600">
            Buy with confidence, <b>{user.name}</b>
          </span>
        ) : (
          <span className="text-sm text-gray-600">Buy with confidence</span>
        )}
      </div>

      <nav className="flex flex-wrap items-center gap-3">
        <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
          Products
        </Link>

        <Link href="/cart" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
          Cart
          {user && (
            <span className="ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-indigo-600 text-white text-xs">
              {cartCount}
            </span>
          )}
        </Link>

        {user && (
          <>
            <Link href="/orders" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
              My Orders
            </Link>

            <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
              Profile
            </Link>

            {user.role === "admin" && (
              <>
                <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
                  Admin
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-700"
                >
                  Admin Orders
                </Link>
              </>
            )}

            <button
              onClick={onLogout}
              className="text-sm font-medium px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
            >
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
              Login
            </Link>
            <Link href="/register" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
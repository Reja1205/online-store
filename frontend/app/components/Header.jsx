"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

export default function Header({ user, onLogout }) {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // close menu when user changes (login/logout)
  useEffect(() => {
    setMenuOpen(false);
  }, [user]);

  const pill =
    "inline-flex items-center justify-center rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition whitespace-nowrap";

  const adminPill =
    "inline-flex items-center justify-center rounded-xl bg-black/30 px-4 py-2 text-sm font-semibold text-white hover:bg-black/40 transition whitespace-nowrap";

  return (
    <header className="mt-4 rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-px shadow">
      <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white font-bold">
                WC
              </span>

              <div className="min-w-0">
                <p className="text-lg font-semibold text-white leading-tight">
                  Western Culture
                </p>
                <p className="text-xs text-white/80">Americans Like Buying</p>
              </div>
            </div>

            {user ? (
              <p className="mt-2 text-sm text-white/90">
                Hi, <span className="font-semibold">{user.name}</span>
                <span className="ml-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {user.role}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/90">
                Fast checkout • Secure orders • Simple shopping
              </p>
            )}
          </div>

          {/* Right actions */}
          <div className="shrink-0 flex items-center gap-2">
            {/* Desktop nav (shows on md+) */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className={pill}>
                Home
              </Link>
              <Link href="/products" className={pill}>
                Products
              </Link>

              {user ? (
                <>
                  <Link href="/cart" className={pill}>
                    <span>Cart</span>
                    <span className="ml-2 inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full bg-white text-gray-900 text-xs font-bold">
                      {cartCount}
                    </span>
                  </Link>

                  <Link href="/checkout" className={pill}>
                    Checkout
                  </Link>

                  <Link href="/orders" className={pill}>
                    My Orders
                  </Link>

                  <Link href="/profile" className={pill}>
                    Profile
                  </Link>

                  {user.role === "admin" ? (
                    <>
                      <Link href="/admin" className={adminPill}>
                        Admin Dashboard
                      </Link>
                      <Link href="/admin/orders" className={adminPill}>
                        Admin Orders
                      </Link>
                    </>
                  ) : null}

                  <button
                    onClick={onLogout}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition whitespace-nowrap"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link href="/register" className={adminPill}>
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button (shows below md) */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition"
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all ${
            menuOpen ? "max-h-130mt-4" : "max-h-0"
          }`}
        >
          <div className="h-px w-full bg-white/20 mb-4" />

          <nav className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              <Link href="/" className={pill} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link
                href="/products"
                className={pill}
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Link>

              {user ? (
                <Link
                  href="/cart"
                  className={pill}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Cart</span>
                  <span className="ml-2 inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full bg-white text-gray-900 text-xs font-bold">
                    {cartCount}
                  </span>
                </Link>
              ) : null}

              {user ? (
                <Link
                  href="/checkout"
                  className={pill}
                  onClick={() => setMenuOpen(false)}
                >
                  Checkout
                </Link>
              ) : null}
            </div>

            {user ? (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/orders"
                  className={pill}
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  className={pill}
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>

                {user.role === "admin" ? (
                  <>
                    <Link
                      href="/admin"
                      className={adminPill}
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/orders"
                      className={adminPill}
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Orders
                    </Link>
                  </>
                ) : null}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition whitespace-nowrap"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={adminPill}
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SITE_NAME, SITE_TAGLINE } from "../lib/site";

export default function Header({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [user]);

  const pill =
    "inline-flex items-center justify-center rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 transition whitespace-nowrap min-h-[2.75rem] sm:px-4";

  const adminPill =
    "inline-flex items-center justify-center rounded-xl bg-black/30 px-3 py-2 text-sm font-semibold text-white hover:bg-black/40 transition whitespace-nowrap min-h-[2.75rem] sm:px-4";

  const whiteBtn =
    "rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition whitespace-nowrap min-h-[2.75rem] sm:px-4";

  return (
    <header className="rounded-2xl bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-700 p-px shadow-[var(--shadow-md)]">
      <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white sm:h-10 sm:w-10"
                aria-hidden
              >
                WC
              </span>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold leading-tight text-white sm:text-lg">
                  {SITE_NAME}
                </p>
                <p className="truncate text-[11px] text-white/85 sm:text-xs">{SITE_TAGLINE}</p>
              </div>
            </div>

            {user ? (
              <p className="mt-2 text-xs text-white/90 sm:text-sm">
                Hi, <span className="font-semibold">{user.name}</span>
                <span className="ml-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:text-xs">
                  {user.role}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-white/90 sm:text-sm">Sign in to save items to your cart.</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <nav className="hidden items-center gap-1.5 md:flex md:gap-2" aria-label="Main">
              <Link href="/" className={pill}>
                Home
              </Link>
              <Link href="/products" className={pill}>
                Shop
              </Link>

              {user ? (
                <>
                  <Link href="/cart" className={pill} aria-label={`Cart, ${cartCount} items`}>
                    <span>Cart</span>
                    <span className="ml-2 inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-slate-900">
                      {cartCount}
                    </span>
                  </Link>

                  <Link href="/checkout" className={pill}>
                    Checkout
                  </Link>

                  <Link href="/orders" className={pill}>
                    Orders
                  </Link>

                  <Link href="/profile" className={pill}>
                    Profile
                  </Link>

                  {user.role === "admin" ? (
                    <>
                      <Link href="/admin" className={adminPill}>
                        Admin
                      </Link>
                      <Link href="/admin/orders" className={adminPill}>
                        Admin orders
                      </Link>
                    </>
                  ) : null}

                  <button type="button" onClick={() => void logout()} className={whiteBtn}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={whiteBtn}>
                    Login
                  </Link>
                  <Link href="/register" className={adminPill}>
                    Register
                  </Link>
                </>
              )}
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25 transition md:hidden min-h-[2.75rem]"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          className={`md:hidden overflow-y-auto transition-[max-height] duration-300 ease-in-out ${
            menuOpen ? "mt-4 max-h-[min(70vh,28rem)] border-t border-white/20 pt-4" : "max-h-0"
          }`}
          aria-hidden={!menuOpen}
        >
          <nav className="grid gap-2 pb-1" aria-label="Mobile">
            <div className="flex flex-wrap gap-2">
              <Link href="/" className={pill} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/products" className={pill} onClick={() => setMenuOpen(false)}>
                Shop
              </Link>

              {user ? (
                <>
                  <Link
                    href="/cart"
                    className={pill}
                    onClick={() => setMenuOpen(false)}
                    aria-label={`Cart, ${cartCount} items`}
                  >
                    <span>Cart</span>
                    <span className="ml-2 inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-slate-900">
                      {cartCount}
                    </span>
                  </Link>

                  <Link href="/checkout" className={pill} onClick={() => setMenuOpen(false)}>
                    Checkout
                  </Link>
                </>
              ) : null}
            </div>

            {user ? (
              <div className="flex flex-wrap gap-2">
                <Link href="/orders" className={pill} onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
                <Link href="/profile" className={pill} onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>

                {user.role === "admin" ? (
                  <>
                    <Link href="/admin" className={adminPill} onClick={() => setMenuOpen(false)}>
                      Admin
                    </Link>
                    <Link href="/admin/orders" className={adminPill} onClick={() => setMenuOpen(false)}>
                      Admin orders
                    </Link>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                  className={whiteBtn}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link href="/login" className={whiteBtn} onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className={adminPill} onClick={() => setMenuOpen(false)}>
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

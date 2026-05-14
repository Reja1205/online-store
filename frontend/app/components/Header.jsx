"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SITE_NAME } from "../lib/site";

const navBtn =
  "inline-flex min-h-[2.5rem] items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";

const navBtnSolid =
  "inline-flex min-h-[2.5rem] items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800";

const dropdownItem =
  "block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50";

export default function Header({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [user]);

  useEffect(() => {
    if (!accountOpen) return;

    function handle(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }

    function onKey(e) {
      if (e.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  return (
    <header className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Link href="/" className="flex min-w-0 max-w-full items-center gap-3 shrink-0">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm"
            aria-hidden
          >
            WC
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-semibold tracking-tight text-slate-900">{SITE_NAME}</p>
            {user ? (
              <p className="truncate text-xs text-slate-500">
                Signed in as <span className="font-medium text-slate-700">{user.name}</span>
                {user.role === "admin" ? (
                  <span className="ml-1.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-700">
                    Admin
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Free shipping on qualifying orders</p>
            )}
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <Link href="/products" className={navBtn}>
              Shop
            </Link>

            {user ? (
              <>
                <Link href="/cart" className={navBtn} aria-label={`Cart, ${cartCount} items`}>
                  Cart
                  <span className="ml-1.5 inline-flex min-w-6 items-center justify-center rounded-md bg-slate-200 px-1.5 text-xs font-bold text-slate-800">
                    {cartCount}
                  </span>
                </Link>

                <div className="relative" ref={accountRef}>
                  <button
                    type="button"
                    className={`${navBtn} gap-1`}
                    aria-expanded={accountOpen}
                    aria-haspopup="true"
                    onClick={() => setAccountOpen((v) => !v)}
                  >
                    Account
                    <span className="text-slate-400" aria-hidden>
                      {accountOpen ? "▴" : "▾"}
                    </span>
                  </button>

                  {accountOpen ? (
                    <div
                      className="absolute right-0 top-full z-50 mt-1.5 min-w-[13.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
                      role="menu"
                    >
                      <Link href="/profile" className={dropdownItem} role="menuitem" onClick={() => setAccountOpen(false)}>
                        Profile
                      </Link>
                      <Link href="/orders" className={dropdownItem} role="menuitem" onClick={() => setAccountOpen(false)}>
                        Orders
                      </Link>
                      <Link href="/checkout" className={dropdownItem} role="menuitem" onClick={() => setAccountOpen(false)}>
                        Checkout
                      </Link>
                      {user.role === "admin" ? (
                        <>
                          <div className="my-1 border-t border-slate-100" />
                          <Link href="/admin" className={dropdownItem} role="menuitem" onClick={() => setAccountOpen(false)}>
                            Admin dashboard
                          </Link>
                          <Link href="/admin/orders" className={dropdownItem} role="menuitem" onClick={() => setAccountOpen(false)}>
                            Admin orders
                          </Link>
                        </>
                      ) : null}
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        className={`${dropdownItem} w-full text-left font-medium text-red-600 hover:bg-red-50 hover:text-red-700`}
                        role="menuitem"
                        onClick={() => {
                          setAccountOpen(false);
                          void logout();
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className={navBtn}>
                  Sign in
                </Link>
                <Link href="/register" className={navBtnSolid}>
                  Create account
                </Link>
              </>
            )}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-[2.5rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden ${menuOpen ? "mt-3 border-t border-slate-100 pt-3" : "hidden"}`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          <Link href="/products" className={navBtn} onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          {user ? (
            <>
              <Link href="/cart" className={navBtn} onClick={() => setMenuOpen(false)}>
                Cart ({cartCount})
              </Link>
              <Link href="/profile" className={navBtn} onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link href="/orders" className={navBtn} onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
              <Link href="/checkout" className={navBtn} onClick={() => setMenuOpen(false)}>
                Checkout
              </Link>
              {user.role === "admin" ? (
                <>
                  <Link href="/admin" className={navBtn} onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                  <Link href="/admin/orders" className={navBtn} onClick={() => setMenuOpen(false)}>
                    Admin orders
                  </Link>
                </>
              ) : null}
              <button
                type="button"
                className={`${navBtn} w-full justify-start font-medium text-red-600 hover:bg-red-50`}
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navBtn} onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link href="/register" className={`${navBtnSolid} w-full justify-center`} onClick={() => setMenuOpen(false)}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

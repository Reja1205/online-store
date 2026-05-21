"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";
import HeaderSearch from "./HeaderSearch";
import HeaderSubNav from "./HeaderSubNav";

const navLink =
  "hidden cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-indigo-900/75 transition hover:bg-white/70 hover:text-indigo-950 sm:inline-flex";

const dropdownItemBase =
  "mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition";

const dropdownTones = {
  profile: `${dropdownItemBase} text-indigo-800 hover:bg-indigo-100`,
  orders: `${dropdownItemBase} text-teal-800 hover:bg-teal-100`,
  checkout: `${dropdownItemBase} text-amber-900 hover:bg-amber-100`,
  admin: `${dropdownItemBase} text-violet-800 hover:bg-violet-100`,
  signOut:
    "mx-1.5 mt-1 flex w-[calc(100%-0.75rem)] cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-rose-500 to-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-rose-600 hover:to-red-700",
};

function MenuDot({ className }) {
  return <span className={`h-2 w-2 shrink-0 rounded-full ${className}`} aria-hidden />;
}

function CartIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h2l1.5 9h12l1.5-4H7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 20.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
    </svg>
  );
}

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

  const firstName = user?.name?.split(/\s+/)[0];

  return (
    <header className="site-header header-main w-full">
      <div className="mx-auto max-w-[1500px] px-3 py-3 sm:px-4 lg:py-3.5">
          <div className="flex items-center gap-3 lg:gap-5">
            <BrandLogo size="md" theme="light" />

            <div className="hidden min-w-0 flex-1 lg:block">
              <HeaderSearch className="max-w-2xl" />
            </div>

            <nav className="ml-auto flex items-center gap-1 sm:gap-2" aria-label="Account">
              <Link href="/products" className={navLink}>
                Shop
              </Link>

              <Link
                href="/cart"
                className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                aria-label={`Cart, ${cartCount} items`}
              >
                <CartIcon />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-indigo-700">
                    {cartCount}
                  </span>
                ) : null}
              </Link>

              {user ? (
                <>
                  <Link href="/orders" className={navLink}>
                    Orders
                  </Link>

                  <div className="relative hidden sm:block" ref={accountRef}>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-950 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50"
                      aria-expanded={accountOpen}
                      aria-haspopup="true"
                      onClick={() => setAccountOpen((v) => !v)}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                        {firstName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                      <span className="hidden md:inline">{firstName}</span>
                      <span className="text-slate-400" aria-hidden>
                        ▾
                      </span>
                    </button>

                    {accountOpen ? (
                      <div
                        className="absolute right-0 top-full z-50 mt-2 min-w-[13rem] overflow-hidden rounded-xl border border-indigo-100 bg-white p-1.5 shadow-lg ring-1 ring-indigo-100"
                        role="menu"
                      >
                        {(user.role === "admin" || user.role === "superadmin") ? (
                          <p className="mb-1 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
                            Admin
                          </p>
                        ) : null}
                        <Link href="/profile" className={dropdownTones.profile} role="menuitem" onClick={() => setAccountOpen(false)}>
                          <MenuDot className="bg-indigo-500" />
                          Profile
                        </Link>
                        <Link href="/orders" className={dropdownTones.orders} role="menuitem" onClick={() => setAccountOpen(false)}>
                          <MenuDot className="bg-teal-500" />
                          Orders
                        </Link>
                        <Link href="/checkout" className={dropdownTones.checkout} role="menuitem" onClick={() => setAccountOpen(false)}>
                          <MenuDot className="bg-amber-500" />
                          Checkout
                        </Link>
                        {(user.role === "admin" || user.role === "superadmin") ? (
                          <>
                            <div className="my-1 border-t border-slate-100" />
                            <Link href="/admin" className={dropdownTones.admin} role="menuitem" onClick={() => setAccountOpen(false)}>
                              <MenuDot className="bg-violet-500" />
                              Dashboard
                            </Link>
                          </>
                        ) : null}
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          className={dropdownTones.signOut}
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
                  <Link href="/login" className={`${navLink} !inline-flex`}>
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="hidden cursor-pointer rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:inline-flex"
                  >
                    Join
                  </Link>
                </>
              )}

              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-indigo-300 bg-white p-2 text-indigo-900 shadow-sm hover:bg-indigo-50 lg:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close menu" : "Menu"}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  {menuOpen ? (
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                  )}
                </svg>
              </button>
            </nav>
          </div>

          <div className="mt-3 lg:hidden">
            <HeaderSearch />
          </div>
        </div>

      <HeaderSubNav onOpenMenu={() => setMenuOpen(true)} />

      <div
        id="mobile-nav"
        className={`header-mobile-nav lg:hidden ${menuOpen ? "block px-3 py-3" : "hidden"}`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          <Link href="/products" className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-950 hover:bg-white/80" onClick={() => setMenuOpen(false)}>
            Shop all
          </Link>
          <Link href="/cart" className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-950 hover:bg-white/80" onClick={() => setMenuOpen(false)}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
          {user ? (
            <>
              <Link href="/orders" className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-white/80" onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
              <Link href="/profile" className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-white/80" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              {(user.role === "admin" || user.role === "superadmin") ? (
                <Link href="/admin" className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-white/80" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                className="cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
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
              <Link href="/login" className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white/80" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link href="/register" className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50" onClick={() => setMenuOpen(false)}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

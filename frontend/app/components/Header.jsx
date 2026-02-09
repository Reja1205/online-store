"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header({ user, onLogout, cartCount = 0 }) {
  const [open, setOpen] = useState(false);

  // close menu when user changes (login/logout) or route changes feel
  useEffect(() => {
    setOpen(false);
  }, [user]);

  const NavLink = ({ href, children }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className="rounded-xl px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/15 hover:text-white transition"
    >
      {children}
    </Link>
  );

  return (
    <header className="mt-4 rounded-2xl bg-lonear-to-r from-indigo-600 via-purple-600 to-pink-600 p-px shadow-lg">
      <div className="rounded-2xl bg-black/10 backdrop-blur px-4 py-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white font-bold">
              OS
            </span>
            <div className="leading-tight">
              <div className="text-lg font-semibold text-white">Online Store</div>
              <div className="text-xs text-white/80">
                {user ? (
                  <>
                    Buy with confidence, <span className="font-semibold">{user.name}</span>
                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                      {user.role}
                    </span>
                  </>
                ) : (
                  "Buy with confidence"
                )}
              </div>
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart badge (always visible when logged in) */}
            {user ? (
              <Link
                href="/cart"
                className="relative rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25 transition"
              >
                Cart
                <span className="ml-2 inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-white text-gray-900 text-xs font-bold px-2">
                  {cartCount}
                </span>
              </Link>
            ) : null}

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="sm:hidden rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25 transition"
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? "Close" : "Menu"}
            </button>

            {/* Desktop logout */}
            {user ? (
              <button
                onClick={onLogout}
                className="hidden sm:inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
              >
                Logout
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-black/30 px-4 py-2 text-sm font-semibold text-white hover:bg-black/40 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 mt-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/products">Products</NavLink>

          {user ? (
            <>
              <NavLink href="/checkout">Checkout</NavLink>
              <NavLink href="/orders">My Orders</NavLink>
              <NavLink href="/profile">Profile</NavLink>

              {user.role === "admin" ? (
                <>
                  <NavLink href="/admin">Admin Dashboard</NavLink>
                  <NavLink href="/admin/orders">Admin Orders</NavLink>
                </>
              ) : null}
            </>
          ) : null}
        </div>

        {/* Mobile dropdown */}
        {open ? (
          <div className="sm:hidden mt-4 rounded-2xl bg-white/10 border border-white/15 p-3">
            <div className="grid grid-cols-2 gap-2">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/products">Products</NavLink>

              {user ? (
                <>
                  <NavLink href="/checkout">Checkout</NavLink>
                  <NavLink href="/orders">My Orders</NavLink>
                  <NavLink href="/profile">Profile</NavLink>

                  {user.role === "admin" ? (
                    <>
                      <NavLink href="/admin">Admin Dashboard</NavLink>
                      <NavLink href="/admin/orders">Admin Orders</NavLink>
                    </>
                  ) : null}

                  <button
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                    className="col-span-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink href="/login">Login</NavLink>
                  <NavLink href="/register">Register</NavLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
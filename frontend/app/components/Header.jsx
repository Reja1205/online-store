"use client";

import Link from "next/link";

export default function Header({ user, onLogout }) {
  return (
    <header className="mt-4 rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-[1px shadow">
      <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Brand + tagline */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white font-bold">
                OS
              </span>

              <div>
                <p className="text-lg font-semibold text-white leading-tight">
                  Online Store
                </p>
                <p className="text-xs text-white/80">
                  Buy with confidence
                </p>
              </div>
            </div>

            {/* Logged in user line */}
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

          {/* Right: Nav */}
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
                  className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
                >
                  Cart
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
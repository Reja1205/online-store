"use client";

import Link from "next/link";

export default function Header({ user, onLogout, cartCount = 0 }) {
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

        {user ? (
          <>
            <Link href="/checkout" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
              Checkout
            </Link>

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
                <Link href="/admin/orders" className="text-sm font-medium text-gray-700 hover:text-indigo-700">
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
        ) : (
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
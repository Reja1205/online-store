"use client";

import Link from "next/link";

export default function Header({ user, onLogout }) {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 justify-between items-center">
        <Link href="/" className="font-bold text-lg">
          Online Store
        </Link>

        <nav className="flex gap-4 items-center text-sm">
          <Link href="/products" className="hover:underline">
            Products
          </Link>

          {user && (
            <>
              <Link href="/cart" className="hover:underline">
                Cart
              </Link>

              <Link href="/orders" className="hover:underline">
                My Orders
              </Link>

              <Link href="/profile" className="hover:underline">
                Profile
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>

              <Link href="/admin/orders" className="hover:underline">
                Orders
              </Link>
            </>
          )}

          {user ? (
            <button
              onClick={onLogout}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
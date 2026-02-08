

"use client";

import Link from "next/link";

export default function Header({ user, onLogout }) {
  return (
    <header className="mb-5 rounded-xl border bg-white px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold">
          Online Store
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="hover:underline" href="/products">
            Products
          </Link>

          {user ? (
            <>
              <Link className="hover:underline" href="/cart">
                Cart
              </Link>
              <Link className="hover:underline" href="/orders">
                My Orders
              </Link>
              <Link className="hover:underline" href="/profile">
                Profile
              </Link>

              {user.role === "admin" && (
                <>
                  <Link className="hover:underline" href="/admin">
                    Admin
                  </Link>
                  <Link className="hover:underline" href="/admin/orders">
                    Admin Orders
                  </Link>
                </>
              )}

              <button
                onClick={onLogout}
                className="rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="hover:underline" href="/login">
                Login
              </Link>
              <Link className="hover:underline" href="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
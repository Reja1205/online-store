"use client";

import Link from "next/link";

export default function Header({ user, onLogout }) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Online Store
        </Link>

        <nav className="flex gap-4 items-center text-sm">
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">My Orders</Link>

          {user && <Link href="/profile">Profile</Link>}
          {user?.role === "admin" && <Link href="/admin">Admin</Link>}

          {user ? (
            <button
              onClick={onLogout}
              className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
            >
              Logout
            </button>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
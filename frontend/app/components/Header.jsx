"use client";

import Link from "next/link";

export default function Header({ user, onLogout }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <Link href="/" className="text-xl font-bold">
        Online Store
      </Link>

      <nav className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/">Home</Link>

        {user && (
          <>
            <Link href="/profile">Profile</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link> {/* ← THIS */}
            <Link href="/orders">My Orders</Link>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Link href="/admin">Admin</Link>
            <Link href="/admin/orders">All Orders</Link>
          </>
        )}

        {!user ? (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        ) : (
          <button
            onClick={onLogout}
            className="rounded-lg bg-gray-900 px-3 py-1 text-white hover:bg-black"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
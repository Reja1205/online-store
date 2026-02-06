"use client";

import Link from "next/link";

export default function Header({ user, onLogout }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "10px 0",
      }}
    >
      <Link href="/">Home</Link>

      {!user ? (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      ) : (
        <>
          <Link href="/profile">Profile</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/checkout">Checkout</Link>
          <Link href="/orders">My Orders</Link>

          {user.role === "admin" && (
            <>
              <Link href="/admin">Admin Dashboard</Link>
              <Link href="/admin/orders">Admin Orders</Link>
            </>
          )}

          <button onClick={onLogout} style={{ padding: 8, cursor: "pointer" }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}
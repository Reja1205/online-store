"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <p>Manage your store here.</p>

      <div style={{ display: "grid", gap: 12, marginTop: 16, maxWidth: 320 }}>
        <Link href="/admin/products">
          <button style={{ padding: 10, cursor: "pointer" }}>
            Manage Products
          </button>
        </Link>

        <Link href="/">
          <button style={{ padding: 10, cursor: "pointer" }}>
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
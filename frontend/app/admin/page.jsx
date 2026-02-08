"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAuthenticated } from "../lib/auth";

export default function AdminPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await isAuthenticated();
      setUser(me);
    })();
  }, []);

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>Not logged in.</p>
        <Link href="/login">Login</Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div style={{ padding: 20 }}>
        <p>Admin only.</p>
        <Link href="/profile">Go to Profile</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/"><button style={{ padding: 8 }}>Home</button></Link>
        <Link href="/admin/products"><button style={{ padding: 8 }}>Manage Products</button></Link>
        <Link href="/admin/orders"><button style={{ padding: 8 }}>All Orders</button></Link>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authHeaders, isAuthenticated } from "../../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const STATUS = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setMsg("");
    setError("");

    const u = await isAuthenticated();
    setMe(u);

    if (!u) {
      setError("Not logged in");
      return;
    }
    if (u.role !== "admin") {
      setError("Admin only");
      return;
    }

    const res = await fetch(`${API}/api/orders`, {
      headers: authHeaders(),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.message || "Failed to load orders");
      setOrders([]);
      return;
    }

    setOrders(Array.isArray(data.orders) ? data.orders : []);
  }

  async function updateStatus(orderId, status) {
    setMsg("");
    setError("");

    const res = await fetch(`${API}/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.message || "Failed to update status");
      return;
    }

    setMsg("Status updated ✅");
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin: All Orders</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Link href="/admin"><button style={{ padding: 8 }}>Back Admin</button></Link>
        <Link href="/"><button style={{ padding: 8 }}>Home</button></Link>
        <button onClick={load} style={{ padding: 8 }}>Refresh</button>
      </div>

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div key={o._id} style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
              <p style={{ margin: 0 }}><b>Order:</b> {o._id}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>User:</b> {o.user?.email || "unknown"}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>Status:</b> {o.status}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>Total:</b> ${o.totalUSD ?? 0}</p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {STATUS.map((s) => (
                  <button key={s} style={{ padding: 6 }} onClick={() => updateStatus(o._id, s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
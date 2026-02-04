"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadAllOrders() {
    setMsg("");
    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.message || "Failed to load admin orders");
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setMsg("Network error");
      setOrders([]);
    }
  }

  async function updateStatus(orderId, status) {
    setMsg("");
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.message || "Failed to update status");
        return;
      }

      setMsg("Status updated ✅");
      loadAllOrders();
    } catch {
      setMsg("Network error");
    }
  }

  useEffect(() => {
    loadAllOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin: All Orders</h1>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href="/admin"><button style={{ padding: 8 }}>Back Admin</button></Link>
        <Link href="/"><button style={{ padding: 8 }}>Home</button></Link>
      </div>

      {msg && <p>{msg}</p>}
      {orders.length === 0 && <p>No orders found.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {orders.map((o) => (
          <div key={o._id} style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
            <p><b>User:</b> {o.user?.email || "unknown"}</p>
            <p><b>Status:</b> {o.status}</p>
            <p><b>Total:</b> ${o.totalUSD ?? 0}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
                <button key={s} style={{ padding: 6 }} onClick={() => updateStatus(o._id, s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadOrders() {
    setMsg("");
    try {
      const res = await fetch(`${API}/api/orders/my`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.message || "Failed to load orders");
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setMsg("Network error");
      setOrders([]);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Orders</h1>
      <Link href="/"><button style={{ padding: 8 }}>Back Home</button></Link>

      {msg && <p>{msg}</p>}
      {orders.length === 0 && <p>No orders yet.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {orders.map((o) => (
          <div key={o._id} style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
            <p><b>Status:</b> {o.status}</p>
            <p><b>Total:</b> ${o.totalUSD ?? 0}</p>
            <p><b>Items:</b> {o.items?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
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
  const [error, setError] = useState("");

  async function loadOrders() {
    setError("");
    try {
      const res = await fetch(`${API}/api/orders/my`, { headers: { ...authHeaders() } });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to load orders");
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("Network error");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Orders</h1>
      <Link href="/">← Back Home</Link>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 && !error && <p>No orders yet.</p>}

      {orders.map((o) => (
        <div key={o._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>Order:</b> {o._id}
          <p style={{ margin: "6px 0" }}>Status: {o.status}</p>
          <p style={{ margin: "6px 0" }}>Total: ${o.total}</p>
          <p style={{ margin: "6px 0" }}>Items: {o.items?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}
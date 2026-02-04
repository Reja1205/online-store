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

  async function loadMyOrders() {
    setError("");
    try {
      const res = await fetch(`${API}/api/orders/my`, {
        headers: { ...authHeaders() },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to load orders");
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("Network error");
      setOrders([]);
    }
  }

  useEffect(() => {
    loadMyOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Orders</h1>

      <div style={{ marginBottom: 12 }}>
        <Link href="/">
          <button style={{ padding: 8, cursor: "pointer" }}>Back Home</button>
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}
            >
              <p>
                <b>Order ID:</b> {o._id}
              </p>
              <p>
                <b>Status:</b> {o.status}
              </p>
              <p>
                <b>Items:</b> {Array.isArray(o.items) ? o.items.length : 0}
              </p>
              <p>
                <b>Total:</b> ${o.totalUSD ?? 0}
              </p>

              <hr />

              {Array.isArray(o.items) &&
                o.items.map((it, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <div>
                      {it.name} x {it.qty}
                    </div>
                    <div>${it.price ?? 0} each</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
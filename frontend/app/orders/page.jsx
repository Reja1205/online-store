"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function OrdersPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadMe() {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { ...authHeaders() },
    });
    const data = await res.json();
    if (!res.ok) return null;
    return data.user;
  }

  async function loadOrders(u) {
    setMsg("");
    try {
      const url = u?.role === "admin" ? `${API}/api/orders` : `${API}/api/orders/my`;

      const res = await fetch(url, {
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
    (async () => {
      const u = await loadMe();
      setUser(u);
      if (!u) return;
      await loadOrders(u);
    })();
  }, []);

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Orders</h1>
        <p>Please login first.</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{user.role === "admin" ? "All Orders (Admin)" : "My Orders"}</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Link href="/">Back Home</Link>
        {user.role === "admin" && <Link href="/admin">Admin Dashboard</Link>}
      </div>

      {msg && <p style={{ color: "red" }}>{msg}</p>}

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}
            >
              <p><b>Order:</b> {o._id}</p>
              <p><b>Status:</b> {o.status}</p>
              <p><b>Total:</b> ${o.totalUSD ?? 0}</p>

              {user.role === "admin" && o.user && (
                <p>
                  <b>Customer:</b> {o.user.name} ({o.user.email})
                </p>
              )}

              <details>
                <summary>Items</summary>
                <ul>
                  {(o.items || []).map((it, idx) => (
                    <li key={idx}>
                      {it.name} x {it.qty} = ${it.lineTotal ?? (it.price * it.qty)}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
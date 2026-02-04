"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function loadAllOrders() {
    setError("");
    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: {
          ...authHeaders(),
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || `Failed (${res.status})`);
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (e) {
      setError("Network error");
      setOrders([]);
    }
  }

  async function updateStatus(orderId, status) {
    setMsg("");
    setError("");

    try {
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
        setError(data?.message || `Failed (${res.status})`);
        return;
      }

      setMsg("Status updated ✅");
      setTimeout(() => setMsg(""), 1200);
      await loadAllOrders();
    } catch {
      setError("Network error");
    }
  }

  useEffect(() => {
    loadAllOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin: All Orders</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Link href="/admin">
          <button style={{ padding: 8, cursor: "pointer" }}>Back Admin</button>
        </Link>
        <Link href="/">
          <button style={{ padding: 8, cursor: "pointer" }}>Back Home</button>
        </Link>
      </div>

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
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
                <b>User:</b>{" "}
                {o.user?.email
                  ? `${o.user.name || "User"} (${o.user.email})`
                  : "Unknown"}
              </p>

              <p>
                <b>Status:</b> {o.status}
              </p>

              <p>
                <b>Total:</b> ${o.totalUSD ?? 0}
              </p>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <label>
                  <b>Update Status:</b>
                </label>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

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
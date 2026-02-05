"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [countInfo, setCountInfo] = useState("");

  async function loadAllOrders() {
    setMsg("");
    setError("");
    setCountInfo("");
    console.log("TOKEN:", localStorage.getItem("token"));
console.log("CALLING:", `${API}/api/orders`);

    try {
      const headers = authHeaders();
      if (!headers.Authorization) {
        setError("No admin token found. Please login again as admin.");
        setOrders([]);
        return;
      }

      const res = await fetch(`${API}/api/orders`, {
        headers,
        cache: "no-store", // ✅ prevents stale cache in production
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to load admin orders");
        setOrders([]);
        return;
      }

      // supports {orders:[...]} or plain [...]
      const list = Array.isArray(data) ? data : data.orders;
      const finalList = Array.isArray(list) ? list : [];

      setOrders(finalList);
      setCountInfo(`Loaded ${finalList.length} orders`);
    } catch (e) {
      setError("Network error");
      setOrders([]);
    }
  }

  async function updateStatus(orderId, status) {
    setMsg("");
    setError("");

    try {
      const headers = authHeaders();
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to update status");
        return;
      }

      setMsg("Status updated ✅");
      setTimeout(() => setMsg(""), 1200);

      await loadAllOrders(); // ✅ refresh after update
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
          <button style={{ padding: 8, cursor: "pointer" }}>Home</button>
        </Link>
        <button onClick={loadAllOrders} style={{ padding: 8, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {msg && <p>{msg}</p>}
      {countInfo && <p style={{ opacity: 0.8 }}>{countInfo}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}
            >
              <p style={{ margin: 0 }}>
                <b>Order:</b> {o._id}
              </p>

              <p style={{ margin: "6px 0 0 0" }}>
                <b>User:</b> {o.user?.email || "unknown"}
              </p>

              <p style={{ margin: "6px 0 0 0" }}>
                <b>Status:</b> {o.status}
              </p>

              <p style={{ margin: "6px 0 0 0" }}>
                <b>Total:</b> ${o.totalUSD ?? 0}
              </p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
                  <button
                    key={s}
                    style={{ padding: 6, cursor: "pointer" }}
                    onClick={() => updateStatus(o._id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <hr style={{ margin: "12px 0" }} />

              {Array.isArray(o.items) && o.items.length > 0 ? (
                o.items.map((it, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <div>
                      {it.name} x {it.qty}
                    </div>
                    <div>${it.price ?? 0} each</div>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0 }}>No items</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
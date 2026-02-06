"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "../../lib/api";

const STATUS = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function loadAllOrders() {
    setMsg("");
    setError("");

    const { res, data } = await apiJson("/api/orders");
    if (!res.ok) {
      setError(data?.message || "Failed to load admin orders");
      setOrders([]);
      return;
    }
    setOrders(Array.isArray(data.orders) ? data.orders : []);
  }

  async function updateStatus(orderId, status) {
    setMsg("");
    setError("");

    const { res, data } = await apiJson(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setError(data?.message || "Failed to update status");
      return;
    }

    setMsg("Status updated ✅");
    await loadAllOrders();
  }

  useEffect(() => {
    loadAllOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin: All Orders</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Link href="/admin"><button style={{ padding: 8, cursor: "pointer" }}>Back Admin</button></Link>
        <Link href="/"><button style={{ padding: 8, cursor: "pointer" }}>Home</button></Link>
        <button onClick={loadAllOrders} style={{ padding: 8, cursor: "pointer" }}>Refresh</button>
      </div>

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div key={o._id} style={{ border: "1px solid #ccc", padding: 14, borderRadius: 10 }}>
              <p style={{ margin: 0 }}><b>Order:</b> {o._id}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>User:</b> {o.user?.email || "unknown"}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>Status:</b> {o.status}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>Total:</b> ${o.totalUSD ?? 0}</p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {STATUS.map((s) => (
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

              {Array.isArray(o.items) && o.items.length ? (
                o.items.map((it, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <div>{it.name} x {it.qty}</div>
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
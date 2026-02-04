"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function AdminOrdersPage() {
  // ✅ Important: env is baked at build time. Add fallback so it never becomes undefined.
  const API = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    []
  );

  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: "Bearer " + token } : {};
  }

  async function loadAllOrders() {
    setMsg("");
    setLoading(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setOrders([]);
      setMsg("No token found. Please login as admin again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: { ...authHeaders() },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOrders([]);
        setMsg(data?.message || `Failed to load admin orders (status ${res.status})`);
        setLoading(false);
        return;
      }

      // backend returns: { orders: [...] }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (e) {
      setOrders([]);
      setMsg("Network error");
    } finally {
      setLoading(false);
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.message || `Failed to update status (status ${res.status})`);
        return;
      }

      setMsg("Status updated ✅");
      await loadAllOrders();
    } catch {
      setMsg("Network error");
    }
  }

  useEffect(() => {
    loadAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin: All Orders</h1>

      <p style={{ fontSize: 12, opacity: 0.7 }}>API: {API}</p>

      <div style={{ display: "flex", gap: 10 }}>
        <Link href="/admin">
          <button style={{ padding: 8 }}>Back Admin</button>
        </Link>
        <Link href="/">
          <button style={{ padding: 8 }}>Home</button>
        </Link>
        <button style={{ padding: 8 }} onClick={loadAllOrders}>
          Refresh
        </button>
      </div>

      {msg && <p style={{ marginTop: 12, color: msg.includes("✅") ? "green" : "red" }}>{msg}</p>}

      {loading ? (
        <p style={{ marginTop: 12 }}>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={{ marginTop: 12 }}>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}
            >
              <p>
                <b>Order:</b> {o._id}
              </p>
              <p>
                <b>User:</b> {o.user?.email || "unknown"}
              </p>
              <p>
                <b>Status:</b> {o.status}
              </p>
              <p>
                <b>Total:</b> ${o.totalUSD ?? 0}
              </p>

              {Array.isArray(o.items) && o.items.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <b>Items:</b>
                  {o.items.map((it, idx) => (
                    <div key={idx} style={{ marginTop: 4 }}>
                      {it.name} × {it.qty} (${it.price ?? 0} each)
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
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
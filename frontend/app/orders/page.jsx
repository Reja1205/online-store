"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "../lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadMyOrders() {
    setMsg("");
    const { res, data } = await apiJson("/api/orders/my");
    if (!res.ok) {
      setMsg(data?.message || "Failed to load orders");
      setOrders([]);
      return;
    }
    setOrders(Array.isArray(data.orders) ? data.orders : []);
  }

  useEffect(() => {
    loadMyOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Orders</h1>
      <Link href="/"><button style={{ padding: 8, cursor: "pointer" }}>Home</button></Link>

      {msg && <p>{msg}</p>}
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {orders.map((o) => (
            <div key={o._id} style={{ border: "1px solid #ddd", padding: 14, borderRadius: 10 }}>
              <p style={{ margin: 0 }}><b>Order:</b> {o._id}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>Status:</b> {o.status}</p>
              <p style={{ margin: "6px 0 0 0" }}><b>Total:</b> ${o.totalUSD ?? 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
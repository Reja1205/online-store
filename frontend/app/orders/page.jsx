"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadMyOrders() {
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
    loadMyOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Orders</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Link href="/"><button style={{ padding: 8 }}>Home</button></Link>
      </div>

      {msg && <p>{msg}</p>}
      {orders.length === 0 && <p>No orders yet.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {orders.map((o) => (
          <div key={o._id} style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
            <p><b>Order:</b> {o._id}</p>
            <p><b>Status:</b> {o.status}</p>
            <p><b>Total:</b> ${o.totalUSD ?? 0}</p>

            <hr />
            {Array.isArray(o.items) && o.items.map((it, idx) => (
              <div key={idx} style={{ marginBottom: 6 }}>
                <div>{it.name} x {it.qty}</div>
                <div>${it.price ?? 0} each</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
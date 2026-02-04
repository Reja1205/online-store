"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  async function loadCart() {
    setError("");
    try {
      const res = await fetch(`${API}/api/cart`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to load cart");
        setCart(null);
        return;
      }

      setCart(data.cart);
    } catch {
      setError("Network error");
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQty(productId, qty) {
    setError("");
    try {
      const res = await fetch(`${API}/api/cart/item/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ qty }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data?.message || "Failed to update");

      setCart(data.cart);
    } catch {
      setError("Network error");
    }
  }

  async function removeItem(productId) {
    setError("");
    try {
      const res = await fetch(`${API}/api/cart/item/${productId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json();
      if (!res.ok) return setError(data?.message || "Failed to remove");

      setCart(data.cart);
    } catch {
      setError("Network error");
    }
  }

  const items = cart?.items || [];
  const total = items.reduce((sum, i) => {
    const price = i.product?.price ?? 0;
    return sum + price * i.qty;
  }, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Cart</h1>

      <Link href="/">← Back to Home</Link>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!cart && !error && <p>Loading...</p>}

      {cart && items.length === 0 && <p>Your cart is empty.</p>}

      {items.map((i) => (
        <div
          key={i.product?._id}
          style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 12 }}
        >
          <b>{i.product?.name}</b>
          <p style={{ margin: "6px 0" }}>Price: ${i.product?.price}</p>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => updateQty(i.product._id, Math.max(1, i.qty - 1))}>-</button>
            <span>Qty: {i.qty}</span>
            <button onClick={() => updateQty(i.product._id, i.qty + 1)}>+</button>

            <button onClick={() => removeItem(i.product._id)} style={{ marginLeft: "auto" }}>
              Remove
            </button>
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <h3 style={{ marginTop: 16 }}>Total: ${total.toFixed(2)}</h3>
      )}
    </div>
  );
}
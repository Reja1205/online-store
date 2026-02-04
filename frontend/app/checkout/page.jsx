"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCart() {
    setError("");
    try {
      const res = await fetch(`${API}/api/cart`, { headers: { ...authHeaders() } });
      const data = await res.json();
      if (!res.ok) return setError(data?.message || "Failed to load cart");
      setCart(data.cart);
    } catch {
      setError("Network error");
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function placeOrder() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/checkout`, {
        method: "POST",
        headers: { ...authHeaders() },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Checkout failed");
        return;
      }

      // go to orders page after placing
      router.push("/orders");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => {
    const price = i.product?.price ?? 0;
    return sum + price * i.qty;
  }, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>
      <Link href="/cart">← Back to Cart</Link>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {!cart && !error && <p>Loading...</p>}

      {cart && items.length === 0 && <p>Your cart is empty.</p>}

      {items.map((i) => (
        <div key={i.product?._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>{i.product?.name}</b>
          <p style={{ margin: "6px 0" }}>
            ${i.product?.price} × {i.qty}
          </p>
        </div>
      ))}

      {items.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>Subtotal: ${subtotal.toFixed(2)}</h3>
          <button onClick={placeOrder} disabled={loading} style={{ padding: 10, cursor: "pointer" }}>
            {loading ? "Placing order..." : "Place Order"}
          </button>
        </>
      )}
    </div>
  );
}
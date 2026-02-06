"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: "Bearer " + token } : {};
}

function StockButton({ stock }) {
  const qty = Number(stock ?? 0);
  const inStock = qty > 0;

  return (
    <button
      disabled
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #ccc",
        opacity: 1,
        cursor: "default",
      }}
      title={inStock ? "In Stock" : "Out of Stock"}
    >
      {inStock ? `In Stock (${qty})` : "Out of Stock"}
    </button>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadMe() {
    try {
      const res = await fetch(`${API}/api/auth/me`, { headers: authHeaders() });

      if (res.status === 401) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/api/products`, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.products;
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    }
  }

  useEffect(() => {
    loadMe();
    loadProducts();
  }, []);

  async function addToCart(productId) {
    setMsg("");
    try {
      const res = await fetch(`${API}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ productId, qty: 1 }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message || "Failed to add to cart");
        return;
      }

      setMsg("Added to cart ✅");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("Network error");
    }
  }

  async function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      {msg && <p>{msg}</p>}

      {!user ? (
        <>
          <Link href="/login">Login</Link>
          <br />
          <Link href="/register">Register</Link>
        </>
      ) : (
        <>
          <p>Welcome {user.name}</p>
          <p>Role: {user.role}</p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/profile">Profile</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/orders">My Orders</Link>

            {user.role === "admin" && <Link href="/admin">Admin Dashboard</Link>}
            {user.role === "admin" && <Link href="/admin/orders">Admin Orders</Link>}

            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}

      <hr style={{ margin: "16px 0" }} />

      <h2>Products</h2>

      {products.length === 0 && <p>No products yet.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <StockButton stock={p.stock} />
            </div>

            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                width={140}
                style={{ borderRadius: 8, display: "block", margin: "10px 0" }}
              />
            ) : null}

            <p style={{ margin: 0 }}>Price: ${p.price}</p>
            <p>{p.description}</p>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/products/${p._id}`}>
                <button style={{ padding: 8, cursor: "pointer" }}>View Details</button>
              </Link>

              <button
                style={{ padding: 8, cursor: "pointer" }}
                onClick={() => addToCart(p._id)}
                disabled={!user || Number(p.stock ?? 0) <= 0}
                title={!user ? "Login to add items" : Number(p.stock ?? 0) <= 0 ? "Out of stock" : ""}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
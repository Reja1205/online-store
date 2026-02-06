"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadMe() {
    try {
      const res = await fetch(`${API}/api/auth/me`, { headers: authHeaders() });
      if (res.status === 401) return setUser(null);
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
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ productId, qty: 1 }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg(data?.message || "Failed to add to cart");

      setMsg("Added to cart ✅");
      setTimeout(() => setMsg(""), 1500);
    } catch {
      setMsg("Network error");
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST", headers: authHeaders() });
    } catch {}
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

            {user.role === "admin" && <Link href="/admin/orders">Admin Orders</Link>}
            {user.role === "admin" && <Link href="/admin">Admin Dashboard</Link>}

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
            <h3 style={{ marginTop: 0 }}>{p.name}</h3>

            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                width={160}
                style={{ borderRadius: 8, display: "block", marginBottom: 10 }}
              />
            ) : null}

            <p>Price: ${p.price}</p>
            <p>{p.description}</p>
            <p>Stock: {p.stock}</p>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/products/${p._id}`}>
                <button style={{ padding: 8, cursor: "pointer" }}>View Details</button>
              </Link>

              <button
                style={{ padding: 8, cursor: "pointer" }}
                onClick={() => addToCart(p._id)}
                disabled={!user}
                title={!user ? "Login to add items" : ""}
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
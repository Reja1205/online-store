"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadMe() {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { ...authHeaders() },
      });

      const data = await res.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();

      // supports either {products:[...]} or plain [...]
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

      const data = await res.json();
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
    // If your backend supports logout (cookie-based), keep it.
    // If you're purely token-based, this is optional.
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: { ...authHeaders() },
      });
    } catch {
      // ignore
    }

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

          {/* ✅ UPDATED NAV LINKS */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/profile">Profile</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/orders">My Orders</Link>

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
          <div
            key={p._id}
            style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}
          >
            <h3>{p.name}</h3>
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
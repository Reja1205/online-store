"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function Home() {
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  // ✅ Search + Filter state
  const [search, setSearch] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);

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
      const res = await fetch(`${API}/api/products`);
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

  // ✅ Filtered products (search + stock filter)
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      const matchesSearch = !q || name.includes(q) || desc.includes(q);

      const stockNum = Number(p.stock ?? 0);
      const matchesStock = !onlyInStock || stockNum > 0;

      return matchesSearch && matchesStock;
    });
  }, [products, search, onlyInStock]);

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
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: authHeaders(),
      });
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

      {/* ✅ Search + Filter UI (restored) */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, minWidth: 240 }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
          />
          Only in stock
        </label>

        <button
          onClick={() => {
            setSearch("");
            setOnlyInStock(false);
          }}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Clear
        </button>
      </div>

      <h2 style={{ marginTop: 16 }}>Products</h2>

      {filteredProducts.length === 0 && <p>No matching products.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {filteredProducts.map((p) => {
          const stockNum = Number(p.stock ?? 0);
          const outOfStock = stockNum <= 0;

          return (
            <div
              key={p._id}
              style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0 }}>{p.name}</h3>

                  {/* ✅ Image */}
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      width={140}
                      style={{ borderRadius: 8, display: "block", marginBottom: 10 }}
                    />
                  )}

                  <p style={{ margin: 0 }}>Price: ${p.price}</p>
                  <p style={{ margin: "6px 0" }}>{p.description}</p>
                  <p style={{ margin: 0 }}>Stock: {stockNum}</p>
                </div>

                {/* ✅ Stock badge button (restored) */}
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <button
                    disabled
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #aaa",
                      opacity: 0.9,
                      cursor: "default",
                    }}
                    title={outOfStock ? "Out of stock" : "In stock"}
                  >
                    {outOfStock ? "Out of Stock" : "In Stock"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Link href={`/products/${p._id}`}>
                  <button style={{ padding: 8, cursor: "pointer" }}>View Details</button>
                </Link>

                <button
                  style={{ padding: 8, cursor: outOfStock ? "not-allowed" : "pointer" }}
                  onClick={() => addToCart(p._id)}
                  disabled={!user || outOfStock}
                  title={!user ? "Login to add items" : outOfStock ? "Out of stock" : ""}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: "Bearer " + token } : {};
}

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  // ✅ Search + Filters
  const [q, setQ] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("new"); // new | price_asc | price_desc

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

  // ✅ Apply search/filter/sort client-side
  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = [...products];

    if (query) {
      list = list.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const desc = String(p.description || "").toLowerCase();
        return name.includes(query) || desc.includes(query);
      });
    }

    if (inStockOnly) {
      list = list.filter((p) => toNum(p.stock, 0) > 0);
    }

    if (sort === "price_asc") {
      list.sort((a, b) => toNum(a.price) - toNum(b.price));
    } else if (sort === "price_desc") {
      list.sort((a, b) => toNum(b.price) - toNum(a.price));
    } else {
      // "new" = newest first (createdAt if present)
      list.sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      });
    }

    return list;
  }, [products, q, inStockOnly, sort]);

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

      {/* ✅ Search + Filter Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          style={{ padding: 10, minWidth: 240 }}
        />

        <button
          onClick={() => setInStockOnly((v) => !v)}
          style={{ padding: 10, cursor: "pointer" }}
          title="Toggle in-stock only"
        >
          {inStockOnly ? "In Stock Only ✅" : "In Stock Only"}
        </button>

        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 10 }}>
          <option value="new">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>

        <button
          onClick={() => {
            setQ("");
            setInStockOnly(false);
            setSort("new");
          }}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Clear
        </button>
      </div>

      {filteredProducts.length === 0 && <p>No products found.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {filteredProducts.map((p) => {
          const stockNum = toNum(p.stock, 0);
          const outOfStock = stockNum <= 0;

          return (
            <div key={p._id} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>

                {/* ✅ ACTIVE Stock button (toggles In Stock filter) */}
                <button
                  onClick={() => setInStockOnly(true)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  title="Click to show in-stock products only"
                >
                  {outOfStock ? "Out of Stock" : `Stock (${stockNum})`}
                </button>
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
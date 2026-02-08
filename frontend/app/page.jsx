"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { apiJson, API } from "./lib/api";

export default function Home() {
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  // ✅ Search + Filter
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | in | out

  async function loadMe() {
    const { res, data } = await apiJson("/api/auth/me");
    if (res.status === 401) {
      setUser(null);
      return;
    }
    setUser(data?.user || null);
  }

  async function loadProducts() {
    // ✅ FIX: don't override headers
    const { res, data } = await apiJson("/api/products");
    if (!res.ok) {
      setProducts([]);
      return;
    }
    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    loadMe();
    loadProducts();
  }, []);

  async function addToCart(productId) {
    setMsg("");
    const { res, data } = await apiJson("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty: 1 }),
    });

    if (!res.ok) {
      setMsg(data?.message || "Failed to add to cart");
      return;
    }

    setMsg("Added to cart ✅");
    setTimeout(() => setMsg(""), 1200);
  }

  async function handleLogout() {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST" });
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
  }

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products
      .filter((p) => {
        const name = String(p?.name ?? p?.title ?? "").toLowerCase();
        const desc = String(p?.description ?? "").toLowerCase();
        const matches = !query || name.includes(query) || desc.includes(query);
        return matches;
      })
      .filter((p) => {
        const stock = Number(p?.stock ?? p?.stockQty ?? 0) || 0;
        if (filter === "in") return stock > 0;
        if (filter === "out") return stock <= 0;
        return true;
      });
  }, [products, q, filter]);

  return (
    <div>
      <h1 style={{ margin: 0 }}>Online Store</h1>
      
      <Header user={user} onLogout={handleLogout} />

      {msg && <p>{msg}</p>}

      <hr style={{ margin: "14px 0" }} />

      {/* ✅ Search + Filter UI */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          style={{ padding: 10, minWidth: 260 }}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 10 }}>
          <option value="all">All</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>

        <button onClick={loadProducts} style={{ padding: 10, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      <hr style={{ margin: "14px 0" }} />

      <h2 style={{ marginTop: 0 }}>Products</h2>

      {shown.length === 0 ? <p>No products found.</p> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {shown.map((p) => (
          <ProductCard key={p._id} p={p} user={user} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}
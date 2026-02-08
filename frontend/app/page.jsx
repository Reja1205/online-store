













"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { apiJson, API } from "./lib/api";

export default function Home() {
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

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
    const { res, data } = await apiJson("/api/products", { headers: {} });
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
        return !query || name.includes(query) || desc.includes(query);
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
      <Header user={user} onLogout={handleLogout} />
      {msg && (
        <div className="mb-4 rounded-lg border bg-white px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      <section className="mb-4 rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border px-3 py-2"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="all">All</option>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>

          <button
            onClick={loadProducts}
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black"
          >
            Refresh
          </button>
        </div>
      </section>

      <h2 className="mb-3 text-xl font-semibold">Products</h2>

      {shown.length === 0 ? (
        <p className="text-sm text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shown.map((p) => (
            <ProductCard key={p._id} p={p} user={user} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
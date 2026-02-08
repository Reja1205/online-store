"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { apiJson } from "../lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // search + filter
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | in | out

  async function loadProducts() {
    setMsg("");
    setLoading(true);
    const { res, data } = await apiJson("/api/products", { headers: {} });

    if (!res.ok) {
      setProducts([]);
      setMsg(data?.message || "Failed to load products");
      setLoading(false);
      return;
    }

    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();

    return products
      .filter((p) => {
        if (!query) return true;
        const name = String(p?.name ?? p?.title ?? "").toLowerCase();
        const desc = String(p?.description ?? "").toLowerCase();
        return name.includes(query) || desc.includes(query);
      })
      .filter((p) => {
        const stock = Number(p?.stock ?? p?.stockQty ?? 0) || 0;
        if (filter === "in") return stock > 0;
        if (filter === "out") return stock <= 0;
        return true;
      });
  }, [products, q, filter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>

        <Link href="/">
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition">
            ← Back Home
          </button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="mt-5 bg-white border rounded-2xl p-4 shadow-sm">
        <div className="flex gap-3 flex-wrap items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="flex-1 min-w-55 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-white"
          >
            <option value="all">All</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>

          <button
            onClick={loadProducts}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition"
          >
            Refresh
          </button>
        </div>

        {msg ? <p className="mt-3 text-sm text-red-600">{msg}</p> : null}
      </div>

      {/* Content */}
      {loading ? (
        <p className="mt-6 text-gray-600">Loading products...</p>
      ) : shown.length === 0 ? (
        <p className="mt-6 text-gray-600">No products found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map((p) => (
            <ProductCard
              key={p._id}
              p={p}
              user={null} // products page is public, no add-to-cart here
              onAddToCart={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
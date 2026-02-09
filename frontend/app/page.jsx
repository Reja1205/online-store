"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { apiJson, API } from "./lib/api";

export default function Home() {
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  // ✅ Cart count for header
  const [cartCount, setCartCount] = useState(0);

  // ✅ Search + Filter
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | in | out

  async function loadMe() {
    const { res, data } = await apiJson("/api/auth/me");

    if (res.status === 401) {
      setUser(null);
      setCartCount(0);
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

  // ✅ Load cart count (for badge in header)
  async function loadCartCount() {
    // if not logged in, keep it 0
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      setCartCount(0);
      return;
    }

    const { res, data } = await apiJson("/api/cart", { headers: {} });

    if (!res.ok) {
      setCartCount(0);
      return;
    }

    // supports:
    // { cart: { items: [...] } }
    // { items: [...] }
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.cart?.items)
      ? data.cart.items
      : [];

    const totalQty = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
    setCartCount(totalQty);
  }

  useEffect(() => {
    loadMe();
    loadProducts();
    loadCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // ✅ refresh cart badge immediately
    await loadCartCount();
  }

  async function handleLogout() {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST" });
    } catch {}

    localStorage.removeItem("token");
    setUser(null);
    setCartCount(0);
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
      {/* ✅ pass cartCount so Header can show Cart badge/count */}
      <Header user={user} onLogout={handleLogout} cartCount={cartCount} />

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
            onClick={() => {
              loadProducts();
              loadCartCount();
            }}
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
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

  // Optional: show loading state for products
  const [loadingProducts, setLoadingProducts] = useState(false);

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
    setLoadingProducts(true);

    const { res, data } = await apiJson("/api/products", { headers: {} });

    if (!res.ok) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
    setLoadingProducts(false);
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

    // ✅ listen to cart updates from anywhere (cart page, product page, etc.)
    function onCartUpdated() {
      loadCartCount();
    }

    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
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

    // ✅ notify Header + other pages instantly
    window.dispatchEvent(new Event("cart:updated"));
  }

  async function handleLogout() {
    try {
      await fetch(`${API}/api/auth/logout`, { method: "POST" });
    } catch {}

    localStorage.removeItem("token");
    setUser(null);
    setCartCount(0);

    window.dispatchEvent(new Event("cart:updated"));
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <Header user={user} onLogout={handleLogout} cartCount={cartCount} />

        {/* Toast / message */}
        {msg ? (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
            {msg}
          </div>
        ) : null}

        {/* Search + Filter */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row flex-1 gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-48 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
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
              className="w-full sm:w-auto rounded-xl bg-gray-900 px-5 py-2.5 text-white font-semibold hover:bg-black transition"
            >
              Refresh
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{shown.length}</span> products
          </div>
        </section>

        {/* Products */}
        <div className="mt-6 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          {loadingProducts ? (
            <span className="text-sm text-gray-500">Loading…</span>
          ) : null}
        </div>

        {shown.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No products found.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {shown.map((p) => (
              <ProductCard key={p._id} p={p} user={user} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
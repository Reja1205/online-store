"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: "Bearer " + token } : {};
}

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toFixed(2);
}

export default function Home() {
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  // ✅ UI controls
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest"); // newest | price_asc | price_desc | name_asc

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
      await fetch(`${API}/api/auth/logout`, { method: "POST", headers: authHeaders() });
    } catch {}

    localStorage.removeItem("token");
    setUser(null);
  }

  // ✅ Filter + sort on the client
  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = Array.isArray(products) ? [...products] : [];

    // filter
    if (q) {
      list = list.filter((p) => {
        const name = String(p?.name || "").toLowerCase();
        const desc = String(p?.description || "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    if (inStockOnly) {
      list = list.filter((p) => Number(p?.stock || 0) > 0);
    }

    // sort
    if (sort === "price_asc") {
      list.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    } else if (sort === "price_desc") {
      list.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    } else if (sort === "name_asc") {
      list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
    } else {
      // newest: best effort, fallback keeps API order
      list.sort((a, b) => {
        const da = new Date(a?.createdAt || 0).getTime();
        const db = new Date(b?.createdAt || 0).getTime();
        return db - da;
      });
    }

    return list;
  }, [products, search, inStockOnly, sort]);

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

            {/* User-only orders */}
            <Link href="/orders">My Orders</Link>

            {/* Admin-only: all orders */}
            {user.role === "admin" && <Link href="/admin/orders">Admin Orders</Link>}
            {user.role === "admin" && <Link href="/admin">Admin Dashboard</Link>}

            <button onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}

      <hr style={{ margin: "16px 0" }} />

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        <p style={{ margin: 0, opacity: 0.7 }}>{visibleProducts.length} shown</p>
      </div>

      {/* ✅ Search / Filter / Sort */}
      <div
        style={{
          display: "grid",
          gap: 10,
          marginTop: 12,
          marginBottom: 16,
          maxWidth: 720,
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description..."
          style={{ padding: 10, width: "100%" }}
        />

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            In stock only
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Sort:
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 8 }}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
            </select>
          </label>

          <button
            onClick={() => {
              setSearch("");
              setInStockOnly(false);
              setSort("newest");
            }}
            style={{ padding: 8, cursor: "pointer" }}
          >
            Clear
          </button>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <p>No products match your filters.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {visibleProducts.map((p) => {
            const stock = Number(p?.stock || 0);
            const out = stock <= 0;

            return (
              <div
                key={p._id}
                style={{
                  border: "1px solid #ccc",
                  padding: 16,
                  borderRadius: 8,
                  opacity: out ? 0.75 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <h3 style={{ margin: 0 }}>{p.name}</h3>
                  {out ? (
                    <span style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #999", borderRadius: 999 }}>
                      Out of stock
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #999", borderRadius: 999 }}>
                      In stock: {stock}
                    </span>
                  )}
                </div>

                <p style={{ margin: "8px 0 0 0" }}>
                  <b>${formatPrice(p.price)}</b>
                </p>

                {p.description ? <p style={{ margin: "8px 0 0 0" }}>{p.description}</p> : null}

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <Link href={`/products/${p._id}`}>
                    <button style={{ padding: 8, cursor: "pointer" }}>View Details</button>
                  </Link>

                  <button
                    style={{ padding: 8, cursor: out || !user ? "not-allowed" : "pointer" }}
                    onClick={() => addToCart(p._id)}
                    disabled={!user || out}
                    title={!user ? "Login to add items" : out ? "Out of stock" : ""}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: "Bearer " + token } : {};
}

function getStock(p) {
  // support both naming styles
  const s =
    p?.stockQty ?? p?.stock ?? 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function getPrice(p) {
  const v = p?.priceUSD ?? p?.price ?? 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  // optional: if you already have search/filter states elsewhere, keep them
  const [query, setQuery] = useState("");
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

  async function addToCart(productId) {
    setMsg("");
    try {
      const headers = authHeaders();
      if (!headers.Authorization) {
        setMsg("Please login to add items");
        return;
      }

      const res = await fetch(`${API}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
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

  const shownProducts = products
    .filter((p) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    })
    .filter((p) => (onlyInStock ? getStock(p) > 0 : true));

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

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 10, minWidth: 260 }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
          />
          In stock only
        </label>
      </div>

      <h2 style={{ marginTop: 16 }}>Products</h2>

      {shownProducts.length === 0 && <p>No products found.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {shownProducts.map((p) => {
          const stock = getStock(p);
          const price = getPrice(p);

          const canAdd = !!user && stock > 0;

          return (
            <div
              key={p._id}
              style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>

                {/* ✅ Stock badge (NOT disabling anything) */}
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    fontSize: 12,
                    opacity: stock > 0 ? 1 : 0.6,
                    whiteSpace: "nowrap",
                  }}
                  title={stock > 0 ? "In stock" : "Out of stock"}
                >
                  Stock: {stock}
                </span>
              </div>

              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  width={140}
                  style={{ marginTop: 10, borderRadius: 8 }}
                />
              )}

              <p>Price: ${price}</p>
              <p>{p.description}</p>

              <div style={{ display: "flex", gap: 10 }}>
                <Link href={`/products/${p._id}`}>
                  <button style={{ padding: 8, cursor: "pointer" }}>View Details</button>
                </Link>

                <button
                  style={{ padding: 8, cursor: canAdd ? "pointer" : "not-allowed" }}
                  onClick={() => addToCart(p._id)}
                  disabled={!canAdd}
                  title={
                    !user
                      ? "Login to add items"
                      : stock <= 0
                      ? "Out of stock"
                      : ""
                  }
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
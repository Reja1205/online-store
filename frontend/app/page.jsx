"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");

  async function loadProducts() {
    try {
      setErr("");
      const res = await fetch(`${API}/api/products`, { cache: "no-store" });
      const data = await res.json();

      // support both {products:[...]} and [...]
      const list = Array.isArray(data) ? data : data.products;
      setProducts(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr("Failed to load products");
      setProducts([]);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/admin">Admin Dashboard</Link>
      </div>

      {err && <p style={{ color: "red" }}>{err}</p>}

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 800 }}>
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                border: "1px solid #ddd",
                padding: 16,
                borderRadius: 10,
              }}
            >
              <h3 style={{ margin: "0 0 6px 0" }}>{p.name}</h3>
              <p style={{ margin: 0 }}>Price: ${p.price}</p>
              <p style={{ margin: 0 }}>Stock: {p.stock}</p>
              {p.description ? <p style={{ marginTop: 8 }}>{p.description}</p> : null}

              <Link href={`/products/${p._id}`}>
                <button style={{ marginTop: 10, padding: 10, cursor: "pointer" }}>
                  View Details
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      <div style={{ marginBottom: 20 }}>
        <Link href="/login">Login</Link>
        <br />
        <Link href="/register">Register</Link>
      </div>

      <h2>Products</h2>

      {loading && <p>Loading...</p>}

      {!loading && products.length === 0 && <p>No products yet</p>}

      <div style={{ display: "grid", gap: 20 }}>
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ccc",
              padding: 15,
              borderRadius: 8,
            }}
          >
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p><strong>${p.priceUSD}</strong></p>

            <Link href={`/products/${p._id}`}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
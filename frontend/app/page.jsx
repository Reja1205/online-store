"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://online-store-7kh8.onrender.com"; // fallback for safety

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/api/products`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load products");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {products.length === 0 && !error && <p>Loading products...</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <h3>{p.title || p.name}</h3>
            <p>Price: ${p.priceUSD || p.price}</p>
            <p>{p.description}</p>
            <p>Stock: {p.stockQty || p.stock}</p>

            <Link href={`/products/${p._id}`}>
              <button style={{ padding: 8, cursor: "pointer" }}>
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
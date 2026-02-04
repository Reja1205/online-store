"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const res = await fetch(`${API}/api/products`, { cache: "no-store" });
        const data = await res.json();

        const list = Array.isArray(data) ? data : data.products; // supports both shapes
        setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        setError("Failed to load products");
      }
    }

    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {products.map((p) => (
        <div
          key={p._id}
          style={{
            border: "1px solid #ccc",
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <h3>{p.name}</h3>
          <p>Price: ${p.price}</p>

          <Link href={`/products/${p._id}`}>
            <button style={{ padding: 8, cursor: "pointer" }}>
              View Details
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}
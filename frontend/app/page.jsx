"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Product load error", err);
      }
    }

    loadProducts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      {products.length === 0 && <p>No products found</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ccc",
              padding: 15,
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <h3>{p.title}</h3>

            <p>
              <strong>${p.priceUSD}</strong>
            </p>

            <Link href={`/products/${p._id}`}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
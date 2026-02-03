"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();

      // 🔥 THIS LINE FIXES EVERYTHING
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      {products.length === 0 && <p>No products yet</p>}

      {products.map((p) => (
        <div
          key={p._id}
          style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}
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
  );
}
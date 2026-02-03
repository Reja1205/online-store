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

        // ensure array
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("PRODUCT_LOAD_ERROR", err);
        setProducts([]);
      }
    }

    loadProducts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Online Store</h1>

      <div style={{ display: "grid", gap: 16 }}>
        {products.map((p) => (
          <div
            key={p._id}
            style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}
          >
            <h3>{p.name}</h3>
            <p>Price: ${p.price}</p>
            <p>{p.description}</p>
            <p>Stock: {p.stock}</p>

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
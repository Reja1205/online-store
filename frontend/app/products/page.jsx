"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (e) {
        setErr("Failed to load products");
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      {err && <p style={{ color: "red" }}>{err}</p>}

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p._id}>
              <Link href={`/products/${p._id}`}>{p.name}</Link> — ${p.price}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/">Back home</Link>
      </p>
    </div>
  );
}
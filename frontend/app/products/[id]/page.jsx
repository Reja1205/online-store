"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProductDetailsPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProduct() {
    setLoading(true);
    setErr("");
    setProduct(null);

    try {
      const res = await fetch(`${API}/api/products/${id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || `Request failed (${res.status})`);
        setLoading(false);
        return;
      }

      setProduct(data.product || null);
      setLoading(false);
    } catch (e) {
      setErr("Network error");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [id]);

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1>Product Details</h1>

      {loading && <p>Loading...</p>}

      {!loading && err && (
        <p style={{ color: "red" }}>
          {err}
        </p>
      )}

      {!loading && !err && product && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{product.name}</h2>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock}</p>
          <p>{product.description || "No description"}</p>

          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ maxWidth: "100%", borderRadius: 8, marginTop: 10 }}
            />
          ) : null}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <Link href="/">
          <button style={{ padding: 10, cursor: "pointer" }}>Back to Products</button>
        </Link>

        <button onClick={loadProduct} style={{ padding: 10, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    </div>
  );
}
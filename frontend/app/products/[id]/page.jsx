"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProductDetailsPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [err, setErr] = useState("");

  async function loadProduct() {
    try {
      setErr("");
      const res = await fetch(`${API}/api/products/${id}`, { cache: "no-store" });
      const data = await res.json();

      // expected: { product: {...} }
      if (!res.ok) {
        setErr(data?.message || "Failed to load product");
        setProduct(null);
        return;
      }

      setProduct(data.product || null);
    } catch {
      setErr("Failed to load product");
      setProduct(null);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [id]);

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1>Product Details</h1>

      {err && <p style={{ color: "red" }}>{err}</p>}

      {!product ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 16,
          }}
        >
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

      <div style={{ marginTop: 16 }}>
        <Link href="/">
          <button style={{ padding: 10, cursor: "pointer" }}>Back to Products</button>
        </Link>
      </div>
    </div>
  );
}
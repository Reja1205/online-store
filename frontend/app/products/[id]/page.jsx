"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetails({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setErr(data?.message || "Not found");
          return;
        }
        setProduct(data.product);
      } catch (e) {
        setErr("Failed to load product");
      }
    }
    load();
  }, [id]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Product Details</h1>

      {err && <p style={{ color: "red" }}>{err}</p>}

      {!err && !product && <p>Loading...</p>}

      {product && (
        <>
          <h2>{product.name}</h2>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock}</p>
          <p>{product.description}</p>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ maxWidth: 300 }} />
          ) : null}
        </>
      )}

      <p style={{ marginTop: 20 }}>
        <Link href="/products">Back to products</Link>
      </p>
    </div>
  );
}
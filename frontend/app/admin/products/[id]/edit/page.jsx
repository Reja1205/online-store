"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson, productName, productPrice, productStock } from "../../lib/api";

export default function ProductDetailsPage({ params }) {
  const [p, setP] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const { res, data } = await apiJson(`/api/products/${params.id}`, { headers: {} });

    if (!res.ok) {
      setError(data?.message || "Failed to load product");
      setP(null);a
      return;
    }

    setP(data.product || null);
  }

  useEffect(() => {
    load();
  }, [params.id]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Product Details</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {!p && !error && <p>Loading...</p>}

      {p && (
        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 10 }}>
          <h2 style={{ marginTop: 0 }}>{productName(p)}</h2>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={productName(p)} width={220} style={{ borderRadius: 10 }} />
          ) : null}
          <p>Price: ${productPrice(p)}</p>
          <p>Stock: {productStock(p)}</p>
          {p.description ? <p>{p.description}</p> : null}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <Link href="/"><button style={{ padding: 10, cursor: "pointer" }}>Back to Products</button></Link>
      </div>
    </div>
  );
}
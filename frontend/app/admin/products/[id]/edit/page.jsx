"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProductDetailsPage({ params }) {
  const id = params?.id;
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products/${id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to load product");
        setP(null);
        return;
      }

      setP(data.product || null);
    } catch {
      setError("Network error");
      setP(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Product Details</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!p ? null : (
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
          <h2>{p.name}</h2>
          {p.imageUrl ? (
            <img src={p.imageUrl} width={220} style={{ borderRadius: 8 }} alt={p.name} />
          ) : null}
          <p><b>Price:</b> ${p.price}</p>
          <p><b>Stock:</b> {p.stock}</p>
          <p>{p.description}</p>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link href="/"><button style={{ padding: 8 }}>Back</button></Link>
      </div>
    </div>
  );
}
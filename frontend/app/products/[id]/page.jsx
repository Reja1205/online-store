"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailsPage({ params }) {
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setError("");
        setLoading(true);

        if (!id) {
          setError("Invalid product id");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API}/api/products/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Failed to load product");
          setLoading(false);
          return;
        }

        setProduct(data.product);
      } catch (e) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <Link href="/products">Back to products</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{product?.name}</h1>
      <p>{product?.description}</p>
      <p>Price: ${product?.price}</p>
      <p>Stock: {product?.stock}</p>

      <br />
      <Link href="/products">
        <button style={{ padding: 10, cursor: "pointer" }}>
          Back to products
        </button>
      </Link>
    </div>
  );
}
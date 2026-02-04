"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailsPage() {
  const { id } = useParams(); // ✅ correct for client component
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");

      // ✅ accept only real Mongo ObjectId
      if (!id || typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id)) {
        setError("Invalid product id");
        return;
      }

      try {
        const res = await fetch(`${API}/api/products/${id}`, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Failed to load product");
          return;
        }

        setProduct(data.product || data); // supports both shapes
      } catch (e) {
        setError("Network error");
      }
    }

    load();
  }, [id]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Product Details</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && !product && <p>Loading...</p>}

      {product && (
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
          <h2>{product.name}</h2>
          <p><b>Price:</b> ${product.price}</p>
          <p><b>Stock:</b> {product.stock}</p>
          <p><b>Description:</b> {product.description}</p>
        </div>
      )}

      <button
        onClick={() => router.push("/products")}
        style={{ marginTop: 16, padding: 10, cursor: "pointer" }}
      >
        Back to Products
      </button>
    </div>
  );
}
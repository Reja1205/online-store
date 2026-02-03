"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        const data = await res.json();

        // IMPORTANT LINE
        setProduct(data.product || null);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadProduct();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!product) return <p style={{ padding: 20 }}>Product not found</p>;

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h1>{product.name}</h1>

      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
        />
      )}

      <p><strong>Description:</strong> {product.description || "N/A"}</p>
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>Stock:</strong> {product.stock}</p>

      <button
        onClick={() => router.push("/")}
        style={{ marginTop: 20, padding: 10, cursor: "pointer" }}
      >
        Back to Products
      </button>
    </div>
  );
}
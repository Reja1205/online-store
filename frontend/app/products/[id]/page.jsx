"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("PRODUCT_DETAILS_ERROR", err);
      }
    }

    if (id) loadProduct();
  }, [id]);

  if (!product) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{product.name}</h2>

      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: 200, marginBottom: 16 }}
        />
      )}

      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p>{product.description}</p>

      <button
        onClick={() => router.push("/")}
        style={{ marginTop: 20, padding: 10 }}
      >
        Back to Products
      </button>
    </div>
  );
}
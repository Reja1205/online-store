"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://online-store-7kh8.onrender.com";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    try {
      const res = await fetch(`${API}/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to load product");
      const data = await res.json();
      setProduct(data);
    } catch {
      setError("Product not found");
    }
  }

  if (error) return <p>{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{product.title || product.name}</h2>
      <p>Price: ${product.priceUSD || product.price || 0}</p>
      <p>{product.description || "No description"}</p>
      <p>Stock: {product.stockQty || product.stock || 0}</p>

      <button onClick={() => router.push("/")}>Back to Products</button>
    </div>
  );
}
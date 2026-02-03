"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    try {
      const res = await fetch(`${API}/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch {
      setProduct(null);
    }
  }

  if (!product) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{product.title}</h2>

      <p>Price: ${product.priceUSD}</p>
      <p>Description: {product.description}</p>
      <p>Stock: {product.stockQty}</p>

      <button onClick={() => router.push("/")}>
        Back to Products
      </button>
    </div>
  );
}
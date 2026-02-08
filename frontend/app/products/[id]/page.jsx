"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson, productName, productPrice, productStock } from "../../lib/api";

export default function ProductDetailsPage({ params }) {
  const [p, setP] = useState(null);
  const [error, setError] = useState("");

  async function loadProduct() {
    const { res, data } = await apiJson(`/api/products/${params.id}`);

    if (!res.ok) {
      setError(data?.message || "Failed to load product");
      return;
    }

    setP(data.product || data);
  }

  useEffect(() => {
    loadProduct();
  }, []);

  if (error) {
    return (
      <div className="p-6 text-red-600 font-medium">
        {error}
      </div>
    );
  }

  if (!p) {
    return (
      <div className="p-6 text-gray-600">
        Loading product...
      </div>
    );
  }

  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Back Button */}
      <Link href="/" className="inline-block mb-6">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition">
          ← Back to Products
        </button>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          {name}
        </h1>

        {/* Stock Badge */}
        <span
          className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-4 ${
            stock > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
        </span>

        {/* Image */}
        {p.imageUrl && (
          <img
            src={p.imageUrl}
            alt={name}
            className="w-full max-h-96 object-cover rounded-xl border mb-4"
          />
        )}

        {/* Price */}
        <p className="text-indigo-600 font-semibold text-lg">
          ${price}
        </p>

        {/* Description */}
        {p.description && (
          <p className="text-gray-600 mt-3 leading-relaxed">
            {p.description}
          </p>
        )}
      </div>
    </div>
  );
}
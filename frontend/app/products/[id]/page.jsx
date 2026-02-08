"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson, productName, productPrice, productStock } from "../../lib/api";

export default function ProductDetailsPage({ params }) {
  const { id } = params;

  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProduct() {
    setError("");
    setLoading(true);

    const { res, data } = await apiJson(`/api/products/${id}`, { headers: {} });

    if (!res.ok) {
      setError(data?.message || "Failed to load product");
      setP(null);
      setLoading(false);
      return;
    }

    setP(data?.product || null);
    setLoading(false);
  }

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600 font-medium">{error || "Product not found"}</p>
        <Link href="/products">
          <button className="mt-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
            Back to Products
          </button>
        </Link>
      </div>
    );
  }

  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/products">
        <button className="mb-5 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
          ← Back to Products
        </button>
      </Link>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Image */}
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={name}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        <div className="p-6 flex flex-col gap-3">
          {/* Title + Stock */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>

            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                stock > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
            </span>
          </div>

          {/* Price */}
          <p className="text-xl font-semibold text-indigo-600">${price}</p>

          {/* Description */}
          {p.description ? (
            <p className="text-gray-600 leading-relaxed">{p.description}</p>
          ) : (
            <p className="text-gray-400">No description.</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <Link href="/cart">
              <button className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
                Go to Cart
              </button>
            </Link>

            <Link href="/products">
              <button className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition">
                Continue Shopping
              </button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Product ID: {p._id}
          </p>
        </div>
      </div>
    </div>
  );
}
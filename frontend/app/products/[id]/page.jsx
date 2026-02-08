"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiJson, productName, productPrice, productStock } from "../../lib/api";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id; // ✅ read from URL

  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProduct(productId) {
    setError("");
    setLoading(true);

    // ✅ guard: prevents calling /api/products/undefined
    if (!productId || typeof productId !== "string") {
      setError("Invalid product id");
      setP(null);
      setLoading(false);
      return;
    }

    const { res, data } = await apiJson(`/api/products/${productId}`, { headers: {} });

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
    loadProduct(id);
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
          <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 active:scale-[0.99] transition">
            ← Back to Products
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
        <button className="mb-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 active:scale-[0.99] transition">
          ← Back to Products
        </button>
      </Link>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={name} className="w-full h-72 object-cover" />
        ) : (
          <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>

            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}
            >
              {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
            </span>
          </div>

          <p className="text-xl font-semibold text-indigo-600">${price}</p>

          {p.description ? (
            <p className="text-gray-600 leading-relaxed">{p.description}</p>
          ) : (
            <p className="text-gray-400">No description.</p>
          )}

          <div className="flex gap-3 mt-4 flex-wrap">
            <Link href="/cart">
              <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow transition">
                Go to Cart
              </button>
            </Link>

            <Link href="/products">
              <button className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition">
                Continue Shopping
              </button>
            </Link>
          </div>

          {/* ❌ Removed: Product ID display */}
        </div>
      </div>
    </div>
  );
}
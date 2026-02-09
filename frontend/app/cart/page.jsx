"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson, productName, productPrice, productStock } from "../lib/api";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function normalizeCartItems(data) {
    const list = data?.cart?.items || data?.items || data?.cartItems || [];
    return Array.isArray(list) ? list : [];
  }

  async function loadCart() {
    setError("");
    setMsg("");
    setLoading(true);

    const { res, data } = await apiJson("/api/cart");
    if (!res.ok) {
      setItems([]);
      setLoading(false);
      setError(data?.message || "Failed to load cart");
      return;
    }

    const cartItems = normalizeCartItems(data);
    setItems(cartItems);
    setLoading(false);

    // ✅ update header badge
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart:updated"));
    }
  }

  async function removeItem(productId) {
    setError("");
    setMsg("");

    const ok = confirm("Remove this item from cart?");
    if (!ok) return;

    const { res, data } = await apiJson("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (!res.ok) {
      setError(data?.message || "Remove failed");
      return;
    }

    setMsg("Removed ✅");

    // ✅ refresh cart + update header badge immediately
    await loadCart();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart:updated"));
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const rows = useMemo(() => {
    return items.map((it) => {
      const p = it.product || it.productId || it;
      const id = (p?._id || it.product || it.productId || "").toString();

      return {
        id,
        name: productName(p),
        price: productPrice(p),
        stock: productStock(p),
        qty: Number(it.qty || 1),
        imageUrl: p?.imageUrl || "",
      };
    });
  }, [items]);

  const subtotal = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.price * r.qty, 0);
  }, [rows]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

        <Link href="/products">
          <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
            ← Continue Shopping
          </button>
        </Link>
      </div>

      {msg && (
        <p className="mt-3 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          {msg}
        </p>
      )}
      {error && (
        <p className="mt-3 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <div className="mt-5">
        {rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-gray-600">Your cart is empty.</p>
            <Link href="/products">
              <button className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex gap-4"
                >
                  <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{r.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Price:{" "}
                          <span className="font-medium text-indigo-700">
                            ${r.price}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          r.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {r.stock > 0 ? `In Stock: ${r.stock}` : "Out of Stock"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm text-gray-700">
                        Qty: <span className="font-semibold">{r.qty}</span>
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(r.id)}
                          className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition text-sm font-medium"
                        >
                          Remove
                        </button>

                        <p className="text-sm text-gray-700">
                          Line Total:{" "}
                          <span className="font-semibold text-gray-900">
                            ${(r.price * r.qty).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-gray-700 font-medium">Subtotal</p>
                <p className="text-gray-900 font-bold">${subtotal.toFixed(2)}</p>
              </div>

              <div className="mt-4 flex justify-end">
                <Link href="/checkout">
                  <button className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
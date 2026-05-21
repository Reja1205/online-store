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
    // supports {cart:{items:[...]}} or {items:[...]} or {cartItems:[...]}
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

    // update header badge
    window.dispatchEvent(new Event("cart:updated"));
  }

  async function removeItem(productId, size = "", color = "", lineIndex = null) {
    setError("");
    setMsg("");

    const ok = confirm("Remove this item from cart?");
    if (!ok) return;

    const body =
      productId != null && String(productId).trim() !== ""
        ? {
            productId,
            ...(size ? { size } : {}),
            ...(color ? { color } : {}),
          }
        : typeof lineIndex === "number"
          ? { lineIndex }
          : null;

    if (!body) {
      setError("Could not remove this item. Try clearing the cart or refresh the page.");
      return;
    }

    const { res, data } = await apiJson("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setError(data?.message || "Remove failed");
      return;
    }

    setMsg("Removed ✅");
    await loadCart();
  }

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    return items.map((it, lineIndex) => {
      // ✅ new backend returns: { productId, qty, product: null|{...} }
      const productId = String(it.productId || it.product || it.product?._id || "");
      const p = it.product || null;

      // If product was deleted, show friendly placeholders
      const safeProduct = p || {
        _id: productId,
        name: "Deleted product",
        price: 0,
        stock: 0,
        imageUrl: "",
        description: "",
      };

      return {
        id: productId,
        lineIndex,
        size: it.size || "",
        color: it.color || "",
        lineKey: `${productId}::${it.size || ""}::${it.color || ""}`,
        name: productName(safeProduct),
        price: productPrice(safeProduct),
        stock: productStock(safeProduct),
        qty: Number(it.qty || 1),
        imageUrl: safeProduct.imageUrl || "",
        deleted: !p,
      };
    });
  }, [items]);

  const subtotal = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.price * r.qty, 0);
  }, [rows]);

  if (loading) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-4xl overflow-x-clip p-6">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl overflow-x-clip p-6">
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
                  key={r.lineKey}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex gap-4"
                >
                  <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{r.name}</p>
                        {r.size || r.color ? (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {[r.color && `Color: ${r.color}`, r.size && `Size: ${r.size}`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}

                        {r.deleted && (
                          <p className="text-xs mt-1 text-red-600">
                            This product was deleted by admin. You can remove it from cart.
                          </p>
                        )}

                        <p className="text-sm text-gray-600 mt-2">
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
                          onClick={() => removeItem(r.id, r.size, r.color, r.lineIndex)}
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
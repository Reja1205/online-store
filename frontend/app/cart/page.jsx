"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson, productDisplayPrice, productName, productStock } from "../lib/api";
import ProductPrice from "../components/product/ProductPrice";
import { getCartSummaryPromo } from "../lib/freeShipping";
import { productHasSizes, stockForSize } from "../lib/sizes";
import { weeklyFreeDeliveryLabel } from "../lib/weeklyDelivery";
import { addSaveForLater } from "../lib/saveForLater";
import CartLineQty, { CartLineActionLinks } from "../components/cart/CartLineQty";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingLine, setUpdatingLine] = useState(null);

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

  async function updateQty(row, nextQty) {
    setError("");
    setMsg("");
    const qty = Number(nextQty);
    if (!Number.isFinite(qty) || qty < 1) return;

    setUpdatingLine(row.lineKey);
    const { res, data } = await apiJson("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: row.id,
        size: row.size || undefined,
        color: row.color || undefined,
        lineIndex: row.lineIndex,
        qty,
      }),
    });
    setUpdatingLine(null);

    if (!res.ok) {
      setError(data?.message || "Could not update quantity");
      return;
    }

    setMsg("Quantity updated");
    await loadCart();
  }

  async function saveRowForLater(row) {
    setError("");
    setMsg("");
    if (row.deleted || !row.product) {
      setError("Cannot save a removed product.");
      return;
    }

    addSaveForLater({
      productId: row.id,
      size: row.size,
      color: row.color,
      qty: row.qty,
      name: row.name,
      imageUrl: row.imageUrl,
      price: row.price,
    });

    await removeItem(row.id, row.size, row.color, row.lineIndex);
    setMsg("Saved for later");
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
        product: p,
        price: p ? productDisplayPrice(p) : 0,
        stock: p
          ? productHasSizes(p) && (it.size || "")
            ? stockForSize(p, it.size)
            : productStock(p)
          : productStock(safeProduct),
        qty: Number(it.qty || 1),
        imageUrl: safeProduct.imageUrl || "",
        deleted: !p,
      };
    });
  }, [items]);

  const subtotal = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.price * r.qty, 0);
  }, [rows]);

  const cartPromo = useMemo(() => getCartSummaryPromo(rows, subtotal), [rows, subtotal]);

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
              {rows.map((r) => {
                const maxQty = Math.max(1, Math.min(99, r.stock > 0 ? r.stock : 1));
                const lineBusy = updatingLine === r.lineKey;
                const lineDisabled = r.deleted || r.stock <= 0;

                return (
                  <div
                    key={r.lineKey}
                    className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gray-100">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No image</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{r.name}</p>
                          {r.size || r.color ? (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {[r.color && `Color: ${r.color}`, r.size && `Size: ${r.size}`]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          ) : null}

                          {r.deleted && (
                            <p className="mt-1 text-xs text-red-600">
                              This product was deleted by admin. You can remove it from cart.
                            </p>
                          )}

                          {r.product ? (
                            <div className="mt-2">
                              <ProductPrice product={r.product} size="md" />
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-gray-600">
                              Price:{" "}
                              <span className="font-medium">${r.price.toFixed(2)}</span>
                            </p>
                          )}

                          <p className="mt-2 text-sm font-medium text-[#007600]">
                            {weeklyFreeDeliveryLabel()}
                          </p>
                          <span className="mt-1.5 inline-block rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-slate-700">
                            FREE RETURN
                          </span>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            r.stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {r.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <CartLineQty
                            qty={r.qty}
                            maxQty={maxQty}
                            disabled={lineDisabled}
                            busy={lineBusy}
                            ariaLabel={r.name}
                            onDecrease={() => updateQty(r, r.qty - 1)}
                            onIncrease={() => updateQty(r, r.qty + 1)}
                            onRemove={() =>
                              removeItem(r.id, r.size, r.color, r.lineIndex)
                            }
                          />
                          <CartLineActionLinks
                            busy={lineBusy}
                            onDelete={() =>
                              removeItem(r.id, r.size, r.color, r.lineIndex)
                            }
                            onSaveForLater={() => saveRowForLater(r)}
                          />
                          {lineBusy ? (
                            <span className="text-xs text-gray-500">Updating…</span>
                          ) : null}
                        </div>

                        <p className="text-sm text-gray-700">
                          Subtotal:{" "}
                          <span className="font-semibold text-gray-900">
                            ${(r.price * r.qty).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div
                className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                  cartPromo.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-indigo-200 bg-indigo-50 text-indigo-900"
                }`}
              >
                <p className="font-semibold">{cartPromo.headline}</p>
                <p className="mt-1 text-xs opacity-90">{cartPromo.note}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-700 font-medium">Subtotal</p>
                <p className="text-gray-900 font-bold">${subtotal.toFixed(2)}</p>
              </div>

              {cartPromo.checkoutShippingFree ? (
                <p className="mt-2 text-sm font-medium text-emerald-700">Shipping at checkout: FREE</p>
              ) : null}

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
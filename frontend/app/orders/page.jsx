"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "../lib/api";
import { fmtDate, fmtMoney } from "../lib/format";

function badgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "shipped") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (s === "delivered") return "bg-green-100 text-green-700 border-green-200";
  if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200"; // pending/default
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function loadMyOrders() {
    setMsg("");
    setError("");
    setLoading(true);

    // ✅ Prefer user-only endpoint. Fallback to /api/orders if your backend uses that.
    const tryPaths = ["/api/orders/my", "/api/orders"];

    try {
      let ok = false;
      let final = [];

      for (const path of tryPaths) {
        const { res, data } = await apiJson(path, { cache: "no-store" });

        if (res.status === 401) {
          setError("Please login to view your orders.");
          setOrders([]);
          setLoading(false);
          return;
        }

        if (res.ok) {
          const list = Array.isArray(data) ? data : data?.orders;
          final = Array.isArray(list) ? list : [];
          ok = true;
          break;
        }
      }

      if (!ok) {
        setError("Failed to load orders.");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(final);
    } catch (e) {
      setError("Network error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasOrders = useMemo(() => orders && orders.length > 0, [orders]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login">
              <button className="rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 transition">
                Go to Login
              </button>
            </Link>

            <Link href="/">
              <button className="rounded-xl bg-white px-4 py-2 text-gray-900 font-semibold border hover:bg-gray-50 transition">
                Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-px shadow-sm">
        <div className="rounded-2xl bg-white/10 backdrop-blur px-5 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <p className="mt-1 text-sm text-white/80">
                Track your purchases and order status
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadMyOrders}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
              >
                Refresh
              </button>

              <button
                onClick={() => router.push("/products")}
                className="rounded-xl bg-black/30 px-4 py-2 text-sm font-semibold text-white hover:bg-black/40 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {msg ? (
            <p className="mt-3 text-sm text-white">{msg}</p>
          ) : null}
        </div>
      </div>

      {/* Empty state */}
      {!hasOrders ? (
        <div className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-700 font-medium">No orders yet.</p>
          <p className="text-sm text-gray-600 mt-1">
            Start shopping and your orders will show up here.
          </p>

          <div className="mt-4">
            <Link href="/products">
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition">
                Browse Products
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Orders list */}
          <div className="mt-5 grid gap-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {o.orderNumber ? `Order ${o.orderNumber}` : "Order placed"}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {fmtDate(o.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                        o.status
                      )}`}
                    >
                      {String(o.status || "pending").toUpperCase()}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800">
                      Total: ${fmtMoney(o.totalUSD)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 grid gap-3">
                  {Array.isArray(o.items) && o.items.length > 0 ? (
                    o.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {it?.name || "Item"}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${fmtMoney(it?.price)} × {Number(it?.qty || 1)}
                          </p>
                        </div>

                        <div className="text-sm font-semibold text-gray-900">
                          ${fmtMoney(it?.lineTotal)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No items found.</p>
                  )}
                </div>

                {/* Totals */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Items total</span>
                    <span className="font-semibold text-gray-900">
                      ${fmtMoney(o.itemsTotal)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold text-gray-900">
                      ${fmtMoney(o.shippingFee)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Grand Total
                    </span>
                    <span className="text-lg font-extrabold text-indigo-700">
                      ${fmtMoney(o.totalUSD)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products">
              <button className="rounded-xl bg-gray-900 px-4 py-2 text-white font-semibold hover:bg-black transition">
                Shop More
              </button>
            </Link>

            <Link href="/">
              <button className="rounded-xl bg-gray-100 px-4 py-2 text-gray-900 font-semibold hover:bg-gray-200 transition">
                Home
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
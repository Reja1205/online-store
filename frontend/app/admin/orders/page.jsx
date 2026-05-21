"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authHeaders, isAuthenticated } from "../../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const STATUS = ["pending", "paid", "shipped", "delivered", "cancelled"];

function badgeClass(status) {
  switch (status) {
    case "paid":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "shipped":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200"; // pending
  }
}

export default function AdminOrdersPage() {
  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function load() {
    setMsg("");
    setError("");
    setLoading(true);

    const u = await isAuthenticated();
    setMe(u);

    if (!u) {
      setError("Not logged in");
      setOrders([]);
      setLoading(false);
      return;
    }
    if (u.role !== "admin" && u.role !== "superadmin") {
      setError("Admin only");
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/orders`, {
        headers: authHeaders(),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Failed to load orders");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("Network error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    setMsg("");
    setError("");
    setBusyId(orderId);

    try {
      const res = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Failed to update status");
        return;
      }

      setMsg("Status updated ✅");
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusyId("");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const paid = orders.filter((o) => o.status === "paid").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.totalUSD || 0), 0);
    return { total, pending, paid, delivered, revenue };
  }, [orders]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Admin: All Orders
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review all user orders and update their status.
          </p>
          {me?.email ? (
            <p className="text-xs text-gray-500 mt-2">
              Logged in as <span className="font-semibold">{me.email}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin">
            <button className="rounded-xl bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              ← Back Admin
            </button>
          </Link>
          <Link href="/">
            <button className="rounded-xl bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Home
            </button>
          </Link>
          <button
            onClick={load}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {msg}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-extrabold text-amber-700">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-2xl font-extrabold text-indigo-700">{stats.paid}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-2xl font-extrabold text-gray-900">
            ${stats.revenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-gray-700">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-gray-700 font-medium">No orders found.</p>
            <p className="text-sm text-gray-600 mt-1">
              When users place orders, you’ll see them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <div key={o._id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{o._id}</p>
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-semibold">User:</span>{" "}
                      {o.user?.email || "unknown"}
                    </p>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                    <p className="text-lg font-extrabold text-gray-900">
                      ${Number(o.totalUSD ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                {Array.isArray(o.items) && o.items.length > 0 ? (
                  <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Items</p>
                    <div className="grid gap-2">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{it.name}</p>
                            <p className="text-xs text-gray-600">
                              ${Number(it.price || 0).toFixed(2)} × {it.qty}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${Number(it.lineTotal || 0).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Status buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS.map((s) => {
                    const active = s === o.status;
                    const disabled = busyId === o._id;

                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(o._id, s)}
                        disabled={disabled || active}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition border ${
                          active
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        title={active ? "Current status" : "Update status"}
                      >
                        {active ? `✓ ${s}` : s}
                      </button>
                    );
                  })}
                </div>

                {busyId === o._id ? (
                  <p className="mt-2 text-xs text-gray-500">Updating status…</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
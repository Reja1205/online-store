"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";

export default function AdminPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      const { res, data } = await apiJson("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!data?.user || (data.user.role !== "admin" && data.user.role !== "superadmin")) {
        router.push("/profile");
        return;
      }
      setMe(data.user);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            {me ? (
              <p className="mt-1 text-sm text-gray-600">
                Logged in as <span className="font-medium">{me.name}</span> ({me.email})
              </p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:shadow transition"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/products"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition"
          >
            <div className="mb-3 inline-flex rounded-xl bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Products
            </div>
            <p className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition">
              Manage Products
            </p>
            <p className="mt-1 text-sm text-gray-600">View, edit, delete products</p>
          </Link>

          <Link
            href="/admin/products/new"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition"
          >
            <div className="mb-3 inline-flex rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Create
            </div>
            <p className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition">
              Create Product
            </p>
            <p className="mt-1 text-sm text-gray-600">Add product + upload image</p>
          </Link>

          <Link
            href="/admin/orders"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition"
          >
            <div className="mb-3 inline-flex rounded-xl bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Orders
            </div>
            <p className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition">
              All Orders
            </p>
            <p className="mt-1 text-sm text-gray-600">Update order status</p>
          </Link>

          <Link
            href="/admin/returns"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition"
          >
            <div className="mb-3 inline-flex rounded-xl bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Returns
            </div>
            <p className="text-lg font-semibold text-gray-900 group-hover:text-violet-700 transition">
              Return requests
            </p>
            <p className="mt-1 text-sm text-gray-600">Approve refunds or replacements</p>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition"
          >
            <div className="mb-3 inline-flex rounded-xl bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Users
            </div>
            <p className="text-lg font-semibold text-gray-900 group-hover:text-sky-700 transition">
              Users
            </p>
            <p className="mt-1 text-sm text-gray-600">Search, roles, and account actions</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
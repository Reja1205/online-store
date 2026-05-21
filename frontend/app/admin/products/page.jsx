"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson, productName, productPrice, productStock } from "../../lib/api";
import { ADMIN_CATEGORIES, getCategoryLabel } from "../../lib/categories";

export default function AdminProductsPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    const { res, data } = await apiJson("/api/auth/me");
    if (res.status === 401) {
      router.push("/login");
      return null;
    }
    if (!data?.user || (data.user.role !== "admin" && data.user.role !== "superadmin")) {
      router.push("/profile");
      return null;
    }
    setMe(data.user);
    return data.user;
  }

  async function loadProducts(category = categoryFilter) {
    setMsg("");
    setError("");
    setLoading(true);

    const params = new URLSearchParams({ full: "1", limit: "500" });
    if (category) params.set("category", category);
    const path = `/api/products?${params}`;
    const { res, data } = await apiJson(path, { headers: {} });

    setLoading(false);

    if (!res.ok) {
      setProducts([]);
      setError(data?.message || "Failed to load products");
      return;
    }

    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
  }

  async function removeProduct(id) {
    setMsg("");
    setError("");

    if (!confirm("Delete this product from the database?")) return;

    const { res, data } = await apiJson(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError(data?.message || "Delete failed");
      return;
    }

    setMsg("Product deleted from database.");
    await loadProducts();
  }

  useEffect(() => {
    (async () => {
      const user = await loadMe();
      if (user) await loadProducts();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (me) loadProducts(categoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const countsByCategory = useMemo(() => {
    const counts = {};
    for (const p of products) {
      const key = p.category || "uncategorized";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manage products</h1>
            {me ? (
              <p className="mt-1 text-sm text-gray-600">
                Logged in as <span className="font-medium">{me.email}</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Back Admin
            </Link>
            <Link
              href="/admin/products/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add product
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label htmlFor="admin-category-filter" className="mb-1 block text-sm font-medium text-gray-700">
                Filter by category
              </label>
              <select
                id="admin-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">All categories</option>
                {ADMIN_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href={
                categoryFilter
                  ? `/admin/products/new?category=${encodeURIComponent(categoryFilter)}`
                  : "/admin/products/new"
              }
              className="inline-flex min-h-[2.5rem] items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
            >
              {categoryFilter
                ? `+ Add to ${getCategoryLabel(categoryFilter)}`
                : "+ Add product (pick category)"}
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ADMIN_CATEGORIES.filter((c) => countsByCategory[c.value]).map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategoryFilter(c.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  categoryFilter === c.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c.label} ({countsByCategory[c.value]})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {msg ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {msg}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-6 text-gray-600">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-gray-600">
              {categoryFilter
                ? `No products in ${getCategoryLabel(categoryFilter)} yet.`
                : "No products in the database yet."}
            </p>
            <Link
              href={
                categoryFilter
                  ? `/admin/products/new?category=${encodeURIComponent(categoryFilter)}`
                  : "/admin/products/new"
              }
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Add the first product →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-900">{productName(p)}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      ${productPrice(p)} • Stock: {productStock(p)}
                    </p>
                    {p.category ? (
                      <span className="mt-2 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                        {getCategoryLabel(p.category)}
                      </span>
                    ) : (
                      <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        No category
                      </span>
                    )}
                  </div>

                  <span
                    className={
                      productStock(p) > 0
                        ? "shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                        : "shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                    }
                  >
                    {productStock(p) > 0 ? "In stock" : "Out"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {p.bestSeller ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                      Best seller
                    </span>
                  ) : null}
                  {p.featured ? (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-900">
                      Featured
                    </span>
                  ) : null}
                  {p.onSale ? (
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-900">
                      Sale
                    </span>
                  ) : null}
                </div>

                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={productName(p)}
                    className="mt-3 h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mt-3 flex h-40 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
                    No image
                  </div>
                )}

                {p.description ? (
                  <p className="mt-3 line-clamp-2 text-sm text-gray-700">{p.description}</p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/products/${p._id}/edit`}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-800 hover:bg-gray-100"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeProduct(p._id)}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

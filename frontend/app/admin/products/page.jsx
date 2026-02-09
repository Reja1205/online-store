"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson, productName, productPrice, productStock } from "../../lib/api";

export default function AdminProductsPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function loadMe() {
    const { res, data } = await apiJson("/api/auth/me");
    if (res.status === 401) {
      router.push("/login");
      return null;
    }
    if (!data?.user || data.user.role !== "admin") {
      router.push("/profile");
      return null;
    }
    setMe(data.user);
    return data.user;
  }

  async function loadProducts() {
    setMsg("");
    setError("");

    const { res, data } = await apiJson("/api/products", { headers: {} });
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

    if (!confirm("Delete this product?")) return;

    const { res, data } = await apiJson(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError(data?.message || "Delete failed");
      return;
    }

    setMsg("Deleted ✅");
    await loadProducts();
  }

  useEffect(() => {
    (async () => {
      const user = await loadMe();
      if (user) await loadProducts();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manage Products</h1>
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
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Home
            </Link>
            <Link
              href="/admin/products/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + New Product
            </Link>
            <button
              onClick={loadProducts}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Refresh
            </button>
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

        {products.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-gray-600">No products yet.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{productName(p)}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      ${productPrice(p)} • Stock: {productStock(p)}
                    </p>
                  </div>

                  <span
                    className={
                      productStock(p) > 0
                        ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                        : "rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                    }
                  >
                    {productStock(p) > 0 ? "In Stock" : "Out"}
                  </span>
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
                  <p className="mt-3 text-sm text-gray-700 line-clamp-3">{p.description}</p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/products/${p._id}/edit`}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-800 hover:bg-gray-100"
                  >
                    Edit
                  </Link>

                  <button
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
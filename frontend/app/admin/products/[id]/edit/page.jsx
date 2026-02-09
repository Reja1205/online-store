"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function tokenHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function loadProduct() {
    setError("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        headers: {},
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Failed to load product");
        setLoading(false);
        return;
      }

      const p = data?.product;
      setName(p?.name || "");
      setPrice(String(p?.price ?? ""));
      setStock(String(p?.stock ?? ""));
      setDescription(p?.description || "");
      setImageUrl(p?.imageUrl || "");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setError("");
    setMsg("");
    setSaving(true);

    try {
      // default: JSON update
      const res = await fetch(`${API}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...tokenHeader(),
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock),
          description,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Update failed");
        setSaving(false);
        return;
      }

      setMsg("Saved ✅");

      // Optional: if you later enable multipart PUT on backend, we can upload new image here.
      // For now, keep it simple and safe.
      setTimeout(() => setMsg(""), 1200);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (id) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
            <p className="mt-1 text-sm text-gray-600">Update name, price, stock, description.</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Back
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Admin
            </Link>
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

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Current Image</label>
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="mt-2 h-52 w-full rounded-xl object-cover" />
              ) : (
                <div className="mt-2 flex h-52 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
                  No image
                </div>
              )}
            </div>

            {/* Optional future image replace */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Optional: Replace Image</p>
              <p className="mt-1 text-sm text-gray-600">
                This will work only if your backend supports multipart PUT for products.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                className="mt-3 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black"
              />
              {newImage ? (
                <p className="mt-2 text-xs text-gray-600">
                  Selected: <span className="font-medium">{newImage.name}</span>
                </p>
              ) : null}
            </div>

            <button
              onClick={save}
              disabled={saving}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
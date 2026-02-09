"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function tokenHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // AI fields (optional)
  const [category, setCategory] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [tone, setTone] = useState("friendly and professional");
  const [length, setLength] = useState("80-120 words");
  const [loadingAI, setLoadingAI] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function generateDescription() {
    setError("");
    setMsg("");

    if (!name.trim()) {
      setError("Enter product name first");
      return;
    }

    setLoadingAI(true);
    try {
      const res = await fetch(`${API}/api/ai/product-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...tokenHeader(),
        },
        body: JSON.stringify({
          name,
          category,
          keyFeatures,
          tone,
          length,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "AI generation failed");
        return;
      }

      setDescription(data?.description || "");
      setMsg("AI description generated ✅");
      setTimeout(() => setMsg(""), 1200);
    } catch {
      setError("Network error");
    } finally {
      setLoadingAI(false);
    }
  }

  async function createProduct() {
    setError("");
    setMsg("");

    if (!name || price === "" || stock === "") {
      setError("Name, price, and stock are required");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(Number(price)));
    fd.append("stock", String(Number(stock)));
    fd.append("description", description || "");
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
          ...tokenHeader(),
        },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Create failed");
        return;
      }

      setMsg("Product created ✅");
      setTimeout(() => router.push("/admin/products"), 700);
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">New Product</h1>
            <p className="mt-1 text-sm text-gray-600">Create a product and upload an image.</p>
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
                placeholder="e.g. iPhone Case"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="19.99"
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* AI helper */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900">AI Description Helper (optional)</p>
              <p className="mt-1 text-sm text-indigo-900/70">
                Fill these for better text, then click “Generate with AI”.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category (optional)"
                />
                <input
                  className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
                  value={keyFeatures}
                  onChange={(e) => setKeyFeatures(e.target.value)}
                  placeholder="Key features (comma separated)"
                />
                <input
                  className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Tone"
                />
                <input
                  className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="Length"
                />
              </div>

              <button
                type="button"
                onClick={generateDescription}
                disabled={loadingAI}
                className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  loadingAI ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loadingAI ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black"
              />
              {imageFile ? (
                <p className="mt-2 text-xs text-gray-600">
                  Selected: <span className="font-medium">{imageFile.name}</span>
                </p>
              ) : null}
            </div>

            <button
              onClick={createProduct}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
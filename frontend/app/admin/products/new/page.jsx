"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // AI
  const [loadingAI, setLoadingAI] = useState(false);

  async function generateDescription() {
    if (!name) {
      setError("Enter product name first");
      return;
    }

    setError("");
    setLoadingAI(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/product-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "AI failed");
        return;
      }

      setDescription(data.description || "");
    } catch {
      setError("Network error");
    } finally {
      setLoadingAI(false);
    }
  }

  async function createProduct() {
    setError("");
    setMsg("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(Number(price)));
    fd.append("stock", String(stock === "" ? 0 : Number(stock)));
    fd.append("description", description || "");

    if (imageFile) {
      fd.append("image", imageFile);
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: fd,
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.message || "Create failed");
      return;
    }

    setMsg("Product created ✅");

    setName("");
    setPrice("");
    setStock("");
    setDescription("");
    setImageFile(null);

    setTimeout(() => router.push("/admin/products"), 800);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>

      {msg && <p className="text-green-700 mb-2">{msg}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="grid gap-3">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <textarea
          className="border rounded-lg px-3 py-2 min-h-28"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* AI BUTTON */}
        <button
          type="button"
          onClick={generateDescription}
          disabled={loadingAI}
          className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition
            ${
              loadingAI
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
            }`}
        >
          {loadingAI
            ? "Generating..."
            : "✨ Generate Description with AI"}
        </button>

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          className="border rounded-lg px-3 py-2"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={createProduct}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-4 py-3"
        >
          Create Product
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // AI inputs (optional)
  const [category, setCategory] = useState("");
  const [keyFeatures, setKeyFeatures] = useState(""); // comma separated

  const [loadingAI, setLoadingAI] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function generateDescription() {
    setError("");
    setMsg("");

    if (!name.trim()) {
      setError("Please enter product name first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login again as admin.");
      return;
    }

    setLoadingAI(true);

    try {
      const res = await fetch(`${API}/api/ai/product-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          name,
          category,
          keyFeatures, // backend supports string or array
          tone: "friendly and professional",
          length: "80-120 words",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "AI generation failed");
        return;
      }

      setDescription(data?.description || "");
      setMsg("Description generated ✅");
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

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login again as admin.");
      return;
    }

    // ✅ FORM DATA
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(Number(price)));
    fd.append("stock", String(stock === "" ? 0 : Number(stock)));
    fd.append("description", description || "");

    // ✅ IMAGE
    if (imageFile) {
      fd.append("image", imageFile);
    }

    const res = await fetch(`${API}/api/products`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        // DON'T set Content-Type for FormData
      },
      body: fd,
    });

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
    setCategory("");
    setKeyFeatures("");

    setTimeout(() => {
      router.push("/admin/products");
    }, 800);
  }

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h1>New Product</h1>

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        {/* Optional AI helpers */}
        <input
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          placeholder="Key features (comma separated, optional)"
          value={keyFeatures}
          onChange={(e) => setKeyFeatures(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          type="button"
          onClick={generateDescription}
          disabled={loadingAI}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 mt-2 disabled:opacity-60"
        >
          {loadingAI ? "Generating..." : "Generate with AI"}
        </button>

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <button onClick={createProduct}>Create Product</button>
      </div>
    </div>
  );
}
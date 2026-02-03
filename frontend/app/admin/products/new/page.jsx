"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("0");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          imageUrl,
          stock: Number(stock),
        }),
      });

      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>Add Product</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10 }}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ padding: 10 }}
        />

        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={{ padding: 10 }}
        />

        <input
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ padding: 10 }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: 10, minHeight: 90 }}
        />

        {err && <p style={{ color: "red", margin: 0 }}>{err}</p>}

        <button disabled={loading} style={{ padding: 10, cursor: "pointer" }}>
          {loading ? "Creating..." : "Create"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          style={{ padding: 10, cursor: "pointer" }}
        >
          Back
        </button>
      </form>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await apiFetch(`/api/products/${id}`);
        const p = data.product;
        setName(p.name || "");
        setPrice(String(p.price ?? ""));
        setDescription(p.description || "");
        setImageUrl(p.imageUrl || "");
        setStock(String(p.stock ?? 0));
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      await apiFetch(`/api/products/${id}`, {
        method: "PUT",
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
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>Edit Product</h1>

      {err && <p style={{ color: "red" }}>{err}</p>}

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
          placeholder="Image URL"
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

        <button disabled={saving} style={{ padding: 10, cursor: "pointer" }}>
          {saving ? "Saving..." : "Save"}
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
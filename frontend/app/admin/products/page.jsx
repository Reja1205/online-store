"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const data = await apiFetch("/api/products");
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      setErr(e.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Manage Products</h1>

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <Link href="/admin/products/new">
          <button style={{ padding: 10, cursor: "pointer" }}>Add Product</button>
        </Link>

        <Link href="/admin">
          <button style={{ padding: 10, cursor: "pointer" }}>Back</button>
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && !err && products.length === 0 && (
        <p>No products yet. Click “Add Product”.</p>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {products.map((p) => (
          <div
            key={p._id}
            style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}
          >
            <h3 style={{ margin: 0 }}>{p.name}</h3>
            <p style={{ margin: "6px 0" }}>Price: ${p.price}</p>
            <p style={{ margin: "6px 0" }}>Stock: {p.stock}</p>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/admin/products/${p._id}/edit`}>
                <button style={{ padding: 8, cursor: "pointer" }}>Edit</button>
              </Link>

              <button
                onClick={() => handleDelete(p._id)}
                style={{ padding: 8, cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
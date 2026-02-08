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
    <div style={{ padding: 20, maxWidth: 980 }}>
      <h1>Admin: Manage Products</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <Link href="/admin">
          <button style={{ padding: 10, cursor: "pointer" }}>Back Admin</button>
        </Link>
        <Link href="/">
          <button style={{ padding: 10, cursor: "pointer" }}>Home</button>
        </Link>
        <Link href="/admin/products/new">
          <button style={{ padding: 10, cursor: "pointer" }}>+ New Product</button>
        </Link>
        <button onClick={loadProducts} style={{ padding: 10, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {me && (
        <p style={{ marginTop: 0 }}>
          Logged in as <b>{me.email}</b> (role: <b>{me.role}</b>)
        </p>
      )}

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {products.map((p) => (
            <div
              key={p._id}
              style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{ margin: 0 }}>{productName(p)}</h3>
                <span
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 999,
                    padding: "6px 10px",
                    fontSize: 12,
                  }}
                >
                  Stock: {productStock(p)}
                </span>
              </div>

              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={productName(p)}
                  width={140}
                  style={{ marginTop: 10, borderRadius: 10, display: "block" }}
                />
              ) : null}

              <p style={{ margin: "10px 0 0 0" }}>Price: ${productPrice(p)}</p>
              {p.description ? <p style={{ margin: "8px 0 0 0" }}>{p.description}</p> : null}

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <Link href={`/admin/products/${p._id}/edit`}>
                  <button style={{ padding: 10, cursor: "pointer" }}>Edit</button>
                </Link>
                <button
                  onClick={() => removeProduct(p._id)}
                  style={{ padding: 10, cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
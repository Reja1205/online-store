"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const API = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  }, []);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);

  // Create form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState("");

  const [error, setError] = useState("");

  async function fetchMe() {
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    const data = await res.json();
    if (!data?.user || data.user.role !== "admin") {
      router.push("/profile");
      return;
    }

    setMe(data.user);
  }

  async function fetchProducts() {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();

    // support both {products:[...]} and [...]
    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchMe();
        await fetchProducts();
      } catch (e) {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProduct() {
    setError("");
    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    const res = await fetch(`${API}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        description,
        stock: stock === "" ? 0 : Number(stock),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.message || "Create failed");
      return;
    }

    setName("");
    setPrice("");
    setDescription("");
    setStock("");
    await fetchProducts();
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEditName(p.name || "");
    setEditPrice(
      p.price === 0 || p.price ? String(p.price) : p.priceUSD ? String(p.priceUSD) : ""
    );
    setEditDescription(p.description || "");
    setEditStock(
      p.stock === 0 || p.stock ? String(p.stock) : p.stockQty ? String(p.stockQty) : "0"
    );
  }

  async function saveEdit(id) {
    setError("");
    const res = await fetch(`${API}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editName,
        price: Number(editPrice),
        description: editDescription,
        stock: editStock === "" ? 0 : Number(editStock),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.message || "Update failed");
      return;
    }

    setEditingId(null);
    await fetchProducts();
  }

  async function removeProduct(id) {
    setError("");
    const ok = confirm("Delete this product?");
    if (!ok) return;

    const res = await fetch(`${API}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.message || "Delete failed");
      return;
    }

    await fetchProducts();
  }

  async function logout() {
    // optional: call backend logout too, but token-based only needs local clear
    localStorage.removeItem("token");
    router.push("/");
  }

  if (loading) return <div style={{ padding: 20 }}>Loading admin dashboard...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => router.push("/")} style={{ padding: 10, cursor: "pointer" }}>
          Back Home
        </button>

        <button onClick={logout} style={{ padding: 10, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {me && (
        <p style={{ marginTop: 0 }}>
          Welcome <b>{me.name}</b> ({me.email}) — role: <b>{me.role}</b>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr style={{ margin: "18px 0" }} />

      <h2>Create Product</h2>
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
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
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: 10, minHeight: 90 }}
        />
        <button onClick={createProduct} style={{ padding: 10, cursor: "pointer" }}>
          Create
        </button>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 14,
              }}
            >
              {editingId === p._id ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ padding: 10 }}
                  />
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={{ padding: 10 }}
                  />
                  <input
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    style={{ padding: 10 }}
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ padding: 10, minHeight: 80 }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => saveEdit(p._id)}
                      style={{ padding: 10, cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ padding: 10, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ margin: "0 0 6px 0" }}>{p.name}</h3>
                  <p style={{ margin: 0 }}>Price: ${p.price}</p>
                  <p style={{ margin: 0 }}>Stock: {p.stock}</p>
                  {p.description ? <p style={{ margin: "8px 0 0 0" }}>{p.description}</p> : null}

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button onClick={() => startEdit(p)} style={{ padding: 10, cursor: "pointer" }}>
                      Edit
                    </button>
                    <button
                      onClick={() => removeProduct(p._id)}
                      style={{ padding: 10, cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
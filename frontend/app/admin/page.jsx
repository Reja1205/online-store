"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiForm, apiJson } from "../lib/api";

export default function AdminPage() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);

  // create
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function loadMe() {
    const { res, data } = await apiJson("/api/auth/me");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (data?.user?.role !== "admin") {
      router.push("/profile");
      return;
    }
    setMe(data.user);
  }

  async function loadProducts() {
    const { res, data } = await apiJson("/api/products");
    if (!res.ok) {
      setProducts([]);
      return;
    }
    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    (async () => {
      await loadMe();
      await loadProducts();
    })();
  }, []);

  async function createProduct() {
    setError("");
    setMsg("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price);
    fd.append("stock", stock || "0");
    fd.append("description", description || "");
    if (imageFile) fd.append("image", imageFile);

    const { res, data } = await apiForm("/api/products", fd);

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
    await loadProducts();
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEditName(p.name || "");
    setEditPrice(String(p.price || 0));
    setEditStock(String(p.stock || 0));
    setEditDescription(p.description || "");
  }

  async function saveEdit(id) {
    setError("");
    setMsg("");

    const { res, data } = await apiJson(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        price: Number(editPrice),
        stock: Number(editStock),
        description: editDescription,
      }),
    });

    if (!res.ok) {
      setError(data?.message || "Update failed");
      return;
    }

    setMsg("Updated ✅");
    setEditingId(null);
    await loadProducts();
  }

  async function removeProduct(id) {
    if (!confirm("Delete this product?")) return;

    const { res } = await apiJson(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError("Delete failed");
      return;
    }

    setMsg("Deleted ✅");
    await loadProducts();
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => router.push("/")}>Home</button>
        <button onClick={logout}>Logout</button>
      </div>

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      <h2>Create Product</h2>

      <div style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        <input placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files[0])}
        />

        <button onClick={createProduct}>Create</button>
      </div>

      <hr />

      <h2>Products</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {products.map(p => (
          <div key={p._id} style={{ border: "1px solid #ddd", padding: 14 }}>
            {editingId === p._id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} />
                <input value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                <input value={editStock} onChange={e => setEditStock(e.target.value)} />
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} />

                <button onClick={() => saveEdit(p._id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <h3>{p.name}</h3>

                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    width={140}
                    style={{ borderRadius: 8, marginBottom: 8 }}
                  />
                )}

                <p>Price: ${p.price}</p>
                <p>Stock: {p.stock}</p>
                <p>{p.description}</p>

                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => removeProduct(p._id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
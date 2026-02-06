"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiForm, apiJson, productPrice, productStock, productName } from "../lib/api";

export default function AdminPage() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [products, setProducts] = useState([]);

  // create
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null); // ✅ file upload

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
    const { res, data } = await apiJson("/api/products", { headers: {} });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProduct() {
    setError("");
    setMsg("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    // ✅ multipart upload (supports image)
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(Number(price)));
    fd.append("stock", String(stock === "" ? 0 : Number(stock)));
    fd.append("description", description || "");
    if (image) fd.append("image", image);

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
    setImage(null);
    await loadProducts();
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEditName(productName(p));
    setEditPrice(String(productPrice(p)));
    setEditStock(String(productStock(p)));
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
        stock: editStock === "" ? 0 : Number(editStock),
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
    setError("");
    setMsg("");

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

  function logout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <div style={{ padding: 20, maxWidth: 980 }}>
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

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr style={{ margin: "16px 0" }} />

      <h2>Create Product</h2>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ padding: 10 }} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" style={{ padding: 10 }} />
        <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" style={{ padding: 10 }} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ padding: 10, minHeight: 90 }} />

        {/* ✅ Image upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button onClick={createProduct} style={{ padding: 10, cursor: "pointer" }}>
          Create
        </button>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h2>Products</h2>

      {products.length === 0 ? <p>No products yet.</p> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
            {editingId === p._id ? (
              <div style={{ display: "grid", gap: 10 }}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: 10 }} />
                <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ padding: 10 }} />
                <input value={editStock} onChange={(e) => setEditStock(e.target.value)} style={{ padding: 10 }} />
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ padding: 10, minHeight: 80 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => saveEdit(p._id)} style={{ padding: 10, cursor: "pointer" }}>
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} style={{ padding: 10, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <h3 style={{ margin: 0 }}>{productName(p)}</h3>
                  <span style={{ border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
                    Stock: {productStock(p)}
                  </span>
                </div>

                {/* ✅ Step 9 image preview in list */}
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

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => startEdit(p)} style={{ padding: 10, cursor: "pointer" }}>
                    Edit
                  </button>
                  <button onClick={() => removeProduct(p._id)} style={{ padding: 10, cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
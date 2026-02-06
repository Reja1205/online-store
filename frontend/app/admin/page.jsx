"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const API = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", []);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);

  // Create form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  // ✅ image
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function fetchMe() {
    if (!token) return router.push("/login");

    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      return router.push("/login");
    }

    const data = await res.json();
    if (!data?.user || data.user.role !== "admin") return router.push("/profile");

    setMe(data.user);
  }

  async function fetchProducts() {
    const res = await fetch(`${API}/api/products`, { cache: "no-store" });
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.products;
    setProducts(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchMe();
        await fetchProducts();
      } catch {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Upload image to backend -> returns { imageUrl }
  async function uploadImageIfNeeded() {
    if (!imageFile) return "";

    const fd = new FormData();
    fd.append("image", imageFile);

    const res = await fetch(`${API}/api/products/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Image upload failed");

    return data.imageUrl || "";
  }

  async function createProduct() {
    setError("");
    setMsg("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    try {
      const uploadedUrl = await uploadImageIfNeeded();

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
          imageUrl: uploadedUrl || imageUrl || "",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Create failed");
        return;
      }

      setMsg("Product created ✅");
      setName("");
      setPrice("");
      setDescription("");
      setStock("");
      setImageFile(null);
      setImageUrl("");

      await fetchProducts();
    } catch (e) {
      setError(e?.message || "Create failed");
    }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEditName(p.name || "");
    setEditPrice(p.price === 0 || p.price ? String(p.price) : "");
    setEditDescription(p.description || "");
    setEditStock(p.stock === 0 || p.stock ? String(p.stock) : "0");
    setEditImageUrl(p.imageUrl || "");
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
        imageUrl: editImageUrl || "",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.message || "Update failed");
      return;
    }

    setEditingId(null);
    await fetchProducts();
  }

  async function removeProduct(id) {
    setError("");
    if (!confirm("Delete this product?")) return;

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

  function logout() {
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

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr style={{ margin: "18px 0" }} />

      <h2>Create Product</h2>
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10 }} />
        <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: 10 }} />
        <input placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={{ padding: 10 }} />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: 10, minHeight: 90 }}
        />

        {/* ✅ Upload file */}
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />

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
            <div key={p._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
              {editingId === p._id ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: 10 }} />
                  <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ padding: 10 }} />
                  <input value={editStock} onChange={(e) => setEditStock(e.target.value)} style={{ padding: 10 }} />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ padding: 10, minHeight: 80 }}
                  />
                  <input
                    placeholder="Image URL"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    style={{ padding: 10 }}
                  />
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
                  <h3 style={{ margin: "0 0 6px 0" }}>{p.name}</h3>

                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      width={160}
                      style={{ borderRadius: 8, display: "block", marginBottom: 10 }}
                    />
                  ) : null}

                  <p style={{ margin: 0 }}>Price: ${p.price}</p>
                  <p style={{ margin: 0 }}>Stock: {p.stock}</p>
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
      )}
    </div>
  );
}
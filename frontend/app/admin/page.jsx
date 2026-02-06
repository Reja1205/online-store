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
  const [image, setImage] = useState(null); // ⭐ NEW

  // Edit
  const [editingId, setEditingId] = useState(null);

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
  }, []);

  async function createProduct() {
    setError("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("stock", stock || 0);
    if (image) formData.append("image", image);

    const res = await fetch(`${API}/api/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.message || "Create failed");
      return;
    }

    setName("");
    setPrice("");
    setDescription("");
    setStock("");
    setImage(null);

    await fetchProducts();
  }

  async function removeProduct(id) {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    await fetch(`${API}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchProducts();
  }

  async function logout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <button onClick={logout}>Logout</button>

      <h2>Create Product</h2>
      <div style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {image && <img src={URL.createObjectURL(image)} width={120} />}

        <button onClick={createProduct}>Create</button>
      </div>

      <h2>Products</h2>
      {products.map((p) => (
        <div key={p._id} style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
          <h3>{p.name}</h3>

          {p.imageUrl && <img src={p.imageUrl} width={120} />}

          <p>${p.price}</p>
          <button onClick={() => removeProduct(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
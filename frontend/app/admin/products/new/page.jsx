"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiForm, apiJson } from "../../../lib/api";

export default function NewProductPage() {
  const router = useRouter();

  const [me, setMe] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

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

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProduct() {
    setMsg("");
    setError("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

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
    router.push("/admin/products");
  }

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h1>Admin: New Product</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <Link href="/admin/products">
          <button style={{ padding: 10, cursor: "pointer" }}>Back Products</button>
        </Link>
        <Link href="/admin">
          <button style={{ padding: 10, cursor: "pointer" }}>Back Admin</button>
        </Link>
        <Link href="/">
          <button style={{ padding: 10, cursor: "pointer" }}>Home</button>
        </Link>
      </div>

      {me && (
        <p style={{ marginTop: 0 }}>
          Logged in as <b>{me.email}</b> (role: <b>{me.role}</b>)
        </p>
      )}

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={{ padding: 10 }}
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          style={{ padding: 10 }}
        />

        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          style={{ padding: 10 }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={{ padding: 10, minHeight: 90 }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button onClick={createProduct} style={{ padding: 10, cursor: "pointer" }}>
          Create Product
        </button>
      </div>
    </div>
  );
}
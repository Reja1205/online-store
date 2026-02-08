"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "../../../lib/api";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function createProduct() {
    setError("");
    setMsg("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    // ✅ FORM DATA
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(Number(price)));
    fd.append("stock", String(stock === "" ? 0 : Number(stock)));
    fd.append("description", description || "");

    // ✅ IMAGE
    if (imageFile) {
      fd.append("image", imageFile); // IMPORTANT LINE
    }

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: fd, // no JSON header
      }
    );

    const data = await res.json().catch(() => ({}));

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

    // go back to products list
    setTimeout(() => {
      router.push("/admin/products");
    }, 800);
  }

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h1>New Product</h1>

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button onClick={createProduct}>Create Product</button>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiForm, apiJson, productName, productPrice, productStock } from "../../../../lib/api";

export default function EditProductPage({ params }) {
  const router = useRouter();
  const id = params?.id;

  const [me, setMe] = useState(null);
  const [p, setP] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState(null); // optional new image upload

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

  async function loadProduct() {
    setError("");
    const { res, data } = await apiJson(`/api/products/${id}`, { headers: {} });
    if (!res.ok) {
      setError(data?.message || "Failed to load product");
      setP(null);
      return;
    }

    const prod = data?.product || null;
    setP(prod);

    if (prod) {
      setName(productName(prod));
      setPrice(String(productPrice(prod)));
      setStock(String(productStock(prod)));
      setDescription(prod.description || "");
    }
  }

  useEffect(() => {
    (async () => {
      const user = await loadMe();
      if (user) await loadProduct();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    setMsg("");
    setError("");

    if (!name || price === "") {
      setError("Name and price are required");
      return;
    }

    // If admin selected a new image, upload as multipart
    if (image) {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", String(Number(price)));
      fd.append("stock", String(stock === "" ? 0 : Number(stock)));
      fd.append("description", description || "");
      fd.append("image", image);

      const { res, data } = await apiForm(`/api/products/${id}`, fd, { method: "PUT" });

      if (!res.ok) {
        setError(data?.message || "Update failed");
        return;
      }

      setMsg("Updated ✅");
      router.push("/admin/products");
      return;
    }

    // Otherwise normal JSON update
    const { res, data } = await apiJson(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: Number(price),
        stock: stock === "" ? 0 : Number(stock),
        description,
      }),
    });

    if (!res.ok) {
      setError(data?.message || "Update failed");
      return;
    }

    setMsg("Updated ✅");
    router.push("/admin/products");
  }

  return (
    <div style={{ padding: 20, maxWidth: 820 }}>
      <h1>Admin: Edit Product</h1>

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

      {!p ? (
        <p>Loading product...</p>
      ) : (
        <>
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={productName(p)}
              width={180}
              style={{ borderRadius: 10, display: "block", marginBottom: 12 }}
            />
          ) : null}

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

            <div style={{ marginTop: 6 }}>
              <div style={{ marginBottom: 6, opacity: 0.8 }}>Replace image (optional)</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>

            <button onClick={save} style={{ padding: 10, cursor: "pointer" }}>
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
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
  const [image, setImage] = useState(null);

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

    if (!name || price === "" || stock === "") {
      setError("Name, price, and stock are required");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(Number(price)));
    fd.append("stock", String(Number(stock)));
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            {me ? (
              <p className="mt-1 text-sm text-gray-600">
                Logged in as <span className="font-medium">{me.name}</span> ({me.email}) •{" "}
                <span className="font-medium">{me.role}</span>
              </p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Back Home
            </button>
            <button
              onClick={logout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-4 space-y-2">
          {msg ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {msg}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}
        </div>

        {/* Create product + Products list layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Create Product Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create Product</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Admin
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Add a product with image, price, stock, and description.
              </p>

              <div className="mt-5 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. iPhone Case"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="19.99"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="10"
                      inputMode="numeric"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description..."
                    className="min-h-[96px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Product Image</label>
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      JPG / PNG / WebP, up to 5MB.
                    </p>
                  </div>

                  {image ? (
                    <p className="mt-2 text-xs text-gray-600">
                      Selected: <span className="font-medium">{image.name}</span>
                    </p>
                  ) : null}
                </div>

                <button
                  onClick={createProduct}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                <span className="text-sm text-gray-500">{products.length} total</span>
              </div>

              {products.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">No products yet.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {products.map((p) => (
                    <div key={p._id} className="rounded-xl border border-gray-200 p-4">
                      {editingId === p._id ? (
                        <div className="space-y-3">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                            />
                            <input
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                            />
                          </div>

                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="min-h-[80px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(p._id)}
                              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">
                                {productName(p)}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600">
                                ${productPrice(p)} • Stock: {productStock(p)}
                              </p>
                            </div>

                            <span
                              className={
                                productStock(p) > 0
                                  ? "rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                  : "rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                              }
                            >
                              {productStock(p) > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>

                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={productName(p)}
                              className="mt-3 h-40 w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="mt-3 flex h-40 w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
                              No image
                            </div>
                          )}

                          {p.description ? (
                            <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                              {p.description}
                            </p>
                          ) : null}

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => startEdit(p)}
                              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeProduct(p._id)}
                              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
          </div>
        </div>

        {/* footer spacing */}
        <div className="h-10" />
      </div>
    </div>
  );
}
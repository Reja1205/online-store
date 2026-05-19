"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm, {
  buildProductFormData,
  productToForm,
  validateProductForm,
} from "../../../../components/admin/ProductForm";
import { apiForm, apiJson } from "../../../../lib/api";
import { getCategoryLabel } from "../../../../lib/categories";
import { productHomepageSections } from "../../../../lib/productSections";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState(productToForm(null));
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function loadProduct() {
    setError("");
    setLoading(true);

    const { res, data } = await apiJson(`/api/products/${id}`, { headers: {} });

    if (!res.ok) {
      setError(data?.message || "Failed to load product");
      setLoading(false);
      return;
    }

    const p = data?.product;
    setValues(productToForm(p));
    setImageUrl(p?.imageUrl || "");
    setLoading(false);
  }

  async function handleSubmit() {
    setError("");
    setMsg("");

    const validationError = validateProductForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    let res;
    let data;

    if (values.imageFile) {
      const fd = buildProductFormData(values);
      ({ res, data } = await apiForm(`/api/products/${id}`, fd, { method: "PUT" }));
    } else {
      ({ res, data } = await apiJson(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: values.name.trim(),
          price: Number(values.price),
          stock: Number(values.stock),
          description: values.description?.trim() || "",
          category: values.category,
          featured: values.featured,
          bestSeller: values.bestSeller,
          onSale: values.onSale,
          salePrice: values.onSale && values.salePrice !== "" ? Number(values.salePrice) : undefined,
        }),
      }));
    }

    setSubmitting(false);

    if (!res.ok) {
      setError(data?.message || data?.error || "Update failed");
      return;
    }

    const saved = data?.product;
    const categoryLabel = getCategoryLabel(saved?.category || values.category);
    const productName = saved?.name || values.name.trim();
    const sections = productHomepageSections(saved || values);
    const sectionNote = sections.length
      ? ` It will appear in: ${sections.join(", ")}.`
      : " It is not assigned to a homepage section yet — check Best Seller, Featured, or Special Sale below.";

    setMsg(
      data?.warning
        ? `${data.warning} “${productName}” saved (${categoryLabel}).${sectionNote}`
        : `“${productName}” was updated (${categoryLabel}).${sectionNote}`
    );

    if (saved) {
      setValues(productToForm(saved));
      if (saved.imageUrl) setImageUrl(saved.imageUrl);
    } else {
      setValues((v) => ({ ...v, imageFile: null }));
    }
  }

  function dismissStatus() {
    setMsg("");
    setError("");
  }

  useEffect(() => {
    (async () => {
      const { res, data } = await apiJson("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!data?.user || data.user.role !== "admin") {
        router.push("/profile");
        return;
      }
      if (id) await loadProduct();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <p className="text-gray-600">Loading product…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit product</h1>
            <p className="mt-1 text-sm text-gray-600">Update details and category — changes save to MongoDB.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <ProductForm
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Update product in database"
            existingImageUrl={imageUrl}
            status={
              msg
                ? { type: "success", message: msg }
                : error
                  ? { type: "error", message: error }
                  : null
            }
            onDismissStatus={dismissStatus}
          />
        </div>

        {msg ? (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-emerald-400 bg-emerald-600 px-4 py-3 pr-10 text-sm font-medium text-white shadow-lg sm:left-auto sm:right-6"
          >
            {msg}
            <button
              type="button"
              onClick={dismissStatus}
              className="absolute right-3 top-2.5 text-lg leading-none text-white/90 hover:text-white"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

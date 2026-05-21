"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ProductForm, {
  buildProductFormData,
  emptyProductForm,
  validateProductForm,
} from "../../../components/admin/ProductForm";
import { apiForm, apiJson } from "../../../lib/api";
import { getCategoryLabel } from "../../../lib/categories";
import { productHomepageSections } from "../../../lib/productSections";

function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetCategory = searchParams.get("category") || "";

  const [values, setValues] = useState({ ...emptyProductForm, category: presetCategory });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [adminOk, setAdminOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { res, data } = await apiJson("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!data?.user || (data.user.role !== "admin" && data.user.role !== "superadmin")) {
        router.push("/profile");
        return;
      }
      setAdminOk(true);
    })();
  }, [router]);

  useEffect(() => {
    if (presetCategory) {
      setValues((v) => ({ ...v, category: presetCategory }));
    }
  }, [presetCategory]);

  async function handleSubmit() {
    setError("");
    setMsg("");

    const validationError = validateProductForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const fd = buildProductFormData(values);
    const { res, data } = await apiForm("/api/products", fd, { method: "POST" });
    setSubmitting(false);

    if (!res.ok) {
      setError(data?.message || data?.error || "Could not save product to the database.");
      return;
    }

    const saved = data?.product;
    const categoryLabel = getCategoryLabel(saved?.category || values.category);
    const productName = saved?.name || values.name.trim();
    const sections = productHomepageSections(saved || values);
    const sectionNote = sections.length
      ? ` It will appear in: ${sections.join(", ")}.`
      : "";
    setMsg(
      data?.warning
        ? `${data.warning} “${productName}” saved under ${categoryLabel}.${sectionNote}`
        : `“${productName}” was saved under ${categoryLabel}.${sectionNote}`
    );

    setTimeout(() => router.push("/admin/products"), 2000);
  }

  function dismissStatus() {
    setMsg("");
    setError("");
  }

  if (!adminOk) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <p className="text-gray-600">Checking admin access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add product</h1>
            <p className="mt-1 text-sm text-gray-600">
              Choose a category and save — the product is stored in MongoDB.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Back
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <ProductForm
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save product to database"
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
            <span className="mt-1 block text-xs font-normal text-emerald-100">Redirecting to product list…</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-600">Loading…</div>}>
      <NewProductForm />
    </Suspense>
  );
}

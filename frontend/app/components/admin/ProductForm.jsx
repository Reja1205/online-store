"use client";

import { useEffect, useRef } from "react";
import { ADMIN_CATEGORIES, getCategoryLabel } from "../../lib/categories";
import { getCategoryColorMode } from "../../lib/colors";
import { defaultSizeStockForCategory, getCategorySizeMode } from "../../lib/sizes";
import ColorFields from "./ColorFields";
import SizeStockFields from "./SizeStockFields";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export const emptyProductForm = {
  name: "",
  price: "",
  stock: "",
  description: "",
  shortDescription: "",
  category: "",
  sizeStock: [],
  colors: [],
  featured: false,
  bestSeller: false,
  onSale: false,
  salePrice: "",
  imageFile: null,
};

export function productToForm(p) {
  if (!p) return { ...emptyProductForm };
  return {
    name: p.name || "",
    price: String(p.price ?? ""),
    stock: String(p.stock ?? ""),
    description: p.description || "",
    shortDescription: p.shortDescription || "",
    category: p.category || "",
    sizeStock: Array.isArray(p.sizeStock)
      ? p.sizeStock.map((s) => ({ size: s.size, stock: Number(s.stock ?? 0) }))
      : [],
    colors: Array.isArray(p.colors) ? [...p.colors] : [],
    featured: Boolean(p.featured),
    bestSeller: Boolean(p.bestSeller),
    onSale: Boolean(p.onSale),
    salePrice: p.salePrice != null && p.salePrice !== "" ? String(p.salePrice) : "",
    imageFile: null,
  };
}

export function validateProductForm(values) {
  if (!values.name?.trim()) return "Product name is required.";
  if (values.price === "" || Number.isNaN(Number(values.price))) return "Valid price is required.";
  if (Number(values.price) < 0) return "Price cannot be negative.";
  if (values.stock === "" || Number.isNaN(Number(values.stock))) return "Valid stock quantity is required.";
  if (Number(values.stock) < 0) return "Stock cannot be negative.";
  if (!values.category) return "Please select a category.";
  if (getCategorySizeMode(values.category)) {
    if (!values.sizeStock?.length) return "Select at least one size for this clothing category.";
    const hasStock = values.sizeStock.some((s) => Number(s.stock) > 0);
    if (!hasStock) return "Enter stock for at least one size.";
  }
  if (getCategoryColorMode(values.category) && !values.colors?.length) {
    return "Select at least one color for this clothing category.";
  }
  if (values.onSale && values.salePrice !== "") {
    const sale = Number(values.salePrice);
    const regular = Number(values.price);
    if (Number.isNaN(sale) || sale < 0) return "Valid sale price is required.";
    if (sale >= regular) return "Sale price must be lower than the regular price.";
  }
  if (values.onSale && values.salePrice === "") return "Enter a sale price for Special Sale items.";
  return "";
}

/** JSON body for PUT when no image file is uploaded */
export function buildProductJsonBody(values) {
  const payload = {
    name: values.name.trim(),
    price: Number(values.price),
    stock: Number(values.stock),
    description: values.description?.trim() || "",
    shortDescription: values.shortDescription?.trim().slice(0, 200) || "",
    category: values.category,
    featured: values.featured,
    bestSeller: values.bestSeller,
    onSale: values.onSale,
  };

  if (getCategorySizeMode(values.category) && values.sizeStock?.length) {
    payload.sizeStock = values.sizeStock;
    payload.stock = values.sizeStock.reduce((sum, s) => sum + Number(s.stock || 0), 0);
  }

  if (getCategoryColorMode(values.category) && values.colors?.length) {
    payload.colors = values.colors;
  }

  if (values.onSale && values.salePrice !== "") {
    payload.salePrice = Number(values.salePrice);
  }

  return payload;
}

export function buildProductFormData(values, { includeImage = true } = {}) {
  const fd = new FormData();
  fd.append("name", values.name.trim());
  fd.append("price", String(Number(values.price)));
  fd.append("stock", String(Number(values.stock)));
  fd.append("description", values.description?.trim() || "");
  fd.append("shortDescription", values.shortDescription?.trim().slice(0, 200) || "");
  fd.append("category", values.category);
  if (getCategorySizeMode(values.category) && values.sizeStock?.length) {
    fd.append("sizeStock", JSON.stringify(values.sizeStock));
    const total = values.sizeStock.reduce((sum, s) => sum + Number(s.stock || 0), 0);
    fd.set("stock", String(total));
  }
  if (getCategoryColorMode(values.category) && values.colors?.length) {
    fd.append("colors", JSON.stringify(values.colors));
  }
  fd.append("featured", String(values.featured));
  fd.append("bestSeller", String(values.bestSeller));
  fd.append("onSale", String(values.onSale));
  if (values.onSale && values.salePrice !== "") {
    fd.append("salePrice", String(Number(values.salePrice)));
  }
  if (includeImage && values.imageFile) {
    fd.append("image", values.imageFile);
  }
  return fd;
}

function FormStatusAlert({ type, message, onDismiss }) {
  const isSuccess = type === "success";
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
        isSuccess
          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
          : "border-red-300 bg-red-50 text-red-950"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isSuccess ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}
        aria-hidden
      >
        {isSuccess ? "✓" : "!"}
      </span>
      <p className="flex-1 leading-snug">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}

export default function ProductForm({
  values,
  onChange,
  onSubmit,
  submitting = false,
  submitLabel = "Save product",
  showImageUpload = true,
  existingImageUrl = "",
  status = null,
  onDismissStatus,
}) {
  const statusRef = useRef(null);

  useEffect(() => {
    if (status?.message) {
      statusRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [status?.message, status?.type]);

  function set(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Name <span className="text-red-600">*</span>
        </label>
        <input
          className={inputClass}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Cotton T-Shirt"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Price ($) <span className="text-red-600">*</span>
          </label>
          <input
            className={inputClass}
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="19.99"
            inputMode="decimal"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Stock <span className="text-red-600">*</span>
            {getCategorySizeMode(values.category) ? (
              <span className="font-normal text-gray-500"> (auto-sum from sizes)</span>
            ) : null}
          </label>
          <input
            className={inputClass}
            value={
              getCategorySizeMode(values.category)
                ? String(
                    (values.sizeStock || []).reduce((sum, s) => sum + Number(s.stock || 0), 0)
                  )
                : values.stock
            }
            onChange={(e) => set("stock", e.target.value)}
            placeholder="10"
            inputMode="numeric"
            required
            readOnly={Boolean(getCategorySizeMode(values.category))}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category <span className="text-red-600">*</span>
        </label>
        <select
          className={inputClass}
          value={values.category}
          onChange={(e) => {
            const next = e.target.value;
            const prevSizeMode = getCategorySizeMode(values.category);
            const nextSizeMode = getCategorySizeMode(next);
            const prevColorMode = getCategoryColorMode(values.category);
            const nextColorMode = getCategoryColorMode(next);
            const patch = { category: next };
            if (prevSizeMode !== nextSizeMode) {
              patch.sizeStock = nextSizeMode ? defaultSizeStockForCategory(next) : [];
            }
            if (prevColorMode !== nextColorMode) {
              patch.colors = [];
            }
            onChange({ ...values, ...patch });
          }}
          required
        >
          <option value="">Select a category…</option>
          {ADMIN_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {values.category ? (
          <p className="mt-1 text-xs text-gray-500">
            Shoppers will find this under <strong>{getCategoryLabel(values.category)}</strong>.
          </p>
        ) : null}
      </div>

      <SizeStockFields
        category={values.category}
        sizeStock={values.sizeStock}
        onChange={(sizeStock) => onChange({ ...values, sizeStock })}
      />

      <ColorFields
        category={values.category}
        colors={values.colors}
        onChange={(colors) => onChange({ ...values, colors })}
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Homepage sections</p>
        <p className="mt-1 text-xs text-slate-600">
          Checked items appear on the home page and under Shop → Best Sellers / Featured / Sale. Recently
          updated products are listed first (up to 8 per section).
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.bestSeller}
              onChange={(e) => set("bestSeller", e.target.checked)}
            />
            Best Seller
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.onSale}
              onChange={(e) => set("onSale", e.target.checked)}
            />
            Special Sale
          </label>
        </div>
        {values.onSale ? (
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sale price ($) <span className="text-red-600">*</span>
            </label>
            <input
              className={`${inputClass} max-w-xs`}
              value={values.salePrice}
              onChange={(e) => set("salePrice", e.target.value)}
              placeholder="Lower than regular price"
              inputMode="decimal"
            />
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Short description <span className="font-normal text-gray-500">(catalog cards)</span>
        </label>
        <textarea
          className={`${inputClass} min-h-20`}
          value={values.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          placeholder="Brief text under the product name on shop cards (max 200 characters)…"
          maxLength={200}
        />
        <p className="mt-1 text-xs text-gray-500">
          {(values.shortDescription || "").length}/200 characters
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Full description <span className="font-normal text-gray-500">(product page)</span>
        </label>
        <textarea
          className={`${inputClass} min-h-28`}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Longer details shown on the product page…"
        />
      </div>

      {showImageUpload ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Product image</label>
          {existingImageUrl ? (
            <img
              src={existingImageUrl}
              alt="Current product"
              className="mb-3 h-40 w-full max-w-sm rounded-xl object-cover"
            />
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => set("imageFile", e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black"
          />
          {values.imageFile ? (
            <p className="mt-2 text-xs text-gray-600">
              Selected: <span className="font-medium">{values.imageFile.name}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div ref={statusRef} className="space-y-3">
        {status?.message ? (
          <FormStatusAlert type={status.type} message={status.message} onDismiss={onDismissStatus} />
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white sm:w-auto ${
            submitting ? "cursor-wait bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {submitting ? "Saving to database…" : submitLabel}
        </button>

        {submitting ? (
          <p className="text-center text-xs text-slate-500 sm:text-left">Please wait — writing to the database…</p>
        ) : null}
      </div>
    </form>
  );
}

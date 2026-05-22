"use client";

import { useEffect, useState } from "react";
import {
  productHasSizes,
  productSizeOptions,
  stockForSize,
} from "../../lib/sizes";

const selectClass =
  "w-full min-h-[2rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export const compactOptionSelectClass =
  "min-h-[2.25rem] w-auto min-w-[4.5rem] max-w-[7.5rem] shrink-0 rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-8 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50";

export default function ProductSizeSelect({
  product,
  value,
  onChange,
  compact = false,
  className = "",
}) {
  const sizes = productSizeOptions(product);
  const [selected, setSelected] = useState(value || "");

  useEffect(() => {
    if (value !== undefined) setSelected(value || "");
  }, [value]);

  useEffect(() => {
    if (!sizes.length) return;
    if (!selected || !sizes.includes(selected)) {
      const firstInStock = sizes.find((s) => stockForSize(product, s) > 0);
      const next = firstInStock || sizes[0];
      setSelected(next);
      onChange?.(next);
    }
  }, [product, sizes, selected, onChange]);

  if (!productHasSizes(product)) return null;

  return (
    <div className={compact ? "" : "mt-1"}>
      <label className="sr-only" htmlFor={`size-${product._id}`}>
        Size
      </label>
      <select
        id={`size-${product._id}`}
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          onChange?.(e.target.value);
        }}
        className={compact ? `${compactOptionSelectClass} ${className}`.trim() : `${selectClass} ${className}`.trim()}
        aria-label="Select size"
      >
        {sizes.map((size) => {
          const qty = stockForSize(product, size);
          return (
            <option key={size} value={size} disabled={qty <= 0}>
              {size}
              {qty <= 0 ? " — out of stock" : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
}

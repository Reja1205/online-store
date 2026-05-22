"use client";

import { useEffect, useState } from "react";
import {
  productHasSizes,
  productSizeOptions,
  stockForSize,
} from "../../lib/sizes";

export default function ProductSizeGrid({ product, value, onChange, className = "" }) {
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
    <div className={className}>
      <p className="mb-2 text-sm text-slate-900">
        Size: <span className="font-semibold">{selected || "—"}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Select size">
        {sizes.map((size) => {
          const qty = stockForSize(product, size);
          const out = qty <= 0;
          const active = selected === size;
          return (
            <button
              key={size}
              type="button"
              role="option"
              aria-selected={active}
              disabled={out}
              onClick={() => {
                setSelected(size);
                onChange?.(size);
              }}
              className={`min-w-[3.25rem] rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                active
                  ? "border-sky-600 bg-sky-50 text-slate-900 ring-1 ring-sky-600"
                  : out
                    ? "cursor-not-allowed border-dashed border-slate-200 bg-slate-50 text-slate-400"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-500 hover:bg-slate-50"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

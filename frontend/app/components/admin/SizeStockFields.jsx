"use client";

import { useEffect, useMemo } from "react";
import {
  defaultSizeStockForCategory,
  getCategorySizeMode,
  getSizesForCategory,
} from "../../lib/sizes";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export default function SizeStockFields({ category, sizeStock, onChange }) {
  const mode = getCategorySizeMode(category);
  const catalog = useMemo(() => getSizesForCategory(category), [category]);

  useEffect(() => {
    if (!mode) return;
    if (!sizeStock?.length) {
      onChange(defaultSizeStockForCategory(category));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, mode]);

  if (!mode) return null;

  const rows = catalog.map((size) => {
    const existing = sizeStock?.find((s) => s.size === size);
    return { size, stock: existing ? String(existing.stock) : "0", enabled: Boolean(existing) };
  });

  function toggleSize(size, enabled) {
    const next = [...(sizeStock || [])];
    const idx = next.findIndex((s) => s.size === size);
    if (enabled) {
      if (idx < 0) next.push({ size, stock: 0 });
    } else if (idx >= 0) {
      next.splice(idx, 1);
    }
    onChange(next);
  }

  function setStock(size, stock) {
    onChange(
      (sizeStock || []).map((s) =>
        s.size === size ? { ...s, stock: Math.max(0, Number(stock) || 0) } : s
      )
    );
  }

  const label =
    mode === "adult"
      ? "Clothing sizes (Men's / Women's)"
      : "Age sizes (Kids / Child)";

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-xs text-slate-600">
        Check only the sizes you sell and set stock for each. Shoppers can pick from this list only.
      </p>

      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
        {rows.map(({ size, stock, enabled }) => (
          <div
            key={size}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-white bg-white px-3 py-2 shadow-sm"
          >
            <label className="flex min-w-[7rem] flex-1 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => toggleSize(size, e.target.checked)}
              />
              <span className="font-medium text-slate-800">{size}</span>
            </label>
            {enabled ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Stock</span>
                <input
                  type="number"
                  min={0}
                  className={`${inputClass} w-20`}
                  value={stock}
                  onChange={(e) => setStock(size, e.target.value)}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {(sizeStock || []).length === 0 ? (
        <p className="mt-2 text-xs text-amber-800">Select at least one size.</p>
      ) : null}
    </div>
  );
}

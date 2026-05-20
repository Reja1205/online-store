"use client";

import { useEffect, useState } from "react";
import {
  colorSwatchHex,
  productColorOptions,
  productHasColors,
} from "../../lib/colors";

const selectClass =
  "w-full min-h-[2rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const selectClassLg =
  "w-full min-h-[2.75rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export default function ProductColorSelect({
  product,
  value,
  onChange,
  label = "Color",
  layout = "select",
  compact = false,
  showLabel = false,
}) {
  const colors = productColorOptions(product);
  const [selected, setSelected] = useState(value || "");

  useEffect(() => {
    if (value !== undefined) setSelected(value || "");
  }, [value]);

  useEffect(() => {
    if (!colors.length) return;
    if (!selected || !colors.includes(selected)) {
      const next = colors[0];
      setSelected(next);
      onChange?.(next);
    }
  }, [product, colors, selected, onChange]);

  if (!productHasColors(product)) return null;

  const useDropdown = layout === "select" || compact;

  if (useDropdown) {
    const labelEl = showLabel ? (
      <p className={`font-medium text-slate-700 ${compact ? "mb-1 text-xs" : "mb-1.5 text-sm"}`}>
        {label}
      </p>
    ) : (
      <label className="sr-only" htmlFor={`color-${product._id}`}>
        {label}
      </label>
    );

    return (
      <div className={compact ? "" : "mt-1"}>
        {labelEl}
        <select
          id={`color-${product._id}`}
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            onChange?.(e.target.value);
          }}
          className={compact ? selectClass : selectClassLg}
          aria-label="Select color"
        >
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">
        {label}: <span className="font-normal text-slate-600">{selected}</span>
      </p>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Select color">
        {colors.map((color) => {
          const active = selected === color;
          const hex = colorSwatchHex(color);
          return (
            <button
              key={color}
              type="button"
              role="option"
              aria-selected={active}
              title={color}
              onClick={() => {
                setSelected(color);
                onChange?.(color);
              }}
              className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border-2 px-3 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                active
                  ? "border-indigo-600 ring-2 ring-indigo-200"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <span
                className="inline-block h-5 w-5 shrink-0 rounded-full border border-slate-300/80"
                style={{ backgroundColor: hex }}
              />
              <span className="sr-only sm:not-sr-only sm:ml-1.5 text-slate-700">{color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

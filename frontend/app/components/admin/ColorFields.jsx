"use client";

import {
  CLOTHING_COLORS,
  colorSwatchHex,
  getCategoryColorMode,
} from "../../lib/colors";

export default function ColorFields({ category, colors, onChange }) {
  const mode = getCategoryColorMode(category);

  if (!mode) return null;

  const selected = colors || [];

  function toggleColor(name, enabled) {
    const next = [...selected];
    if (enabled) {
      if (!next.includes(name)) next.push(name);
    } else {
      const idx = next.indexOf(name);
      if (idx >= 0) next.splice(idx, 1);
    }
    onChange(next);
  }

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
      <p className="text-sm font-semibold text-slate-900">Available colors</p>
      <p className="mt-1 text-xs text-slate-600">
        Check only the colors you sell for this product. Shoppers can pick from this list only.
      </p>
      <p className="mt-2 text-xs font-medium text-indigo-800">
        {selected.length} color{selected.length === 1 ? "" : "s"} selected
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {CLOTHING_COLORS.map((color) => {
          const enabled = selected.includes(color);
          const hex = colorSwatchHex(color);
          return (
            <label
              key={color}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm transition ${
                enabled
                  ? "border-indigo-400 bg-white ring-1 ring-indigo-200"
                  : "border-white/80 bg-white/60 opacity-80 hover:opacity-100"
              }`}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => toggleColor(color, e.target.checked)}
              />
              <span
                className="inline-block h-4 w-4 shrink-0 rounded-full border border-slate-300/80"
                style={{ backgroundColor: hex }}
                aria-hidden
              />
              <span className="font-medium text-slate-800">{color}</span>
            </label>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <p className="mt-2 text-xs text-amber-800">Select at least one color before saving.</p>
      ) : null}
    </div>
  );
}

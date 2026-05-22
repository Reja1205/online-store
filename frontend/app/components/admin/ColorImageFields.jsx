"use client";

import { useState } from "react";
import { apiForm } from "../../lib/api";
import { colorSwatchHex } from "../../lib/colors";
import {
  normalizeColorImagesList,
  removeColorImage,
  setColorImageUrl,
} from "../../lib/colorImages";

const inputClass =
  "block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black";

export default function ColorImageFields({ colors = [], colorImages = [], onChange }) {
  const [uploadingColor, setUploadingColor] = useState("");
  const [error, setError] = useState("");

  if (!colors.length) return null;

  const normalized = normalizeColorImagesList(colorImages);
  const urlByColor = Object.fromEntries(normalized.map((row) => [row.color, row.imageUrl]));

  async function uploadForColor(color, file) {
    if (!file) return;
    setError("");
    setUploadingColor(color);
    const fd = new FormData();
    fd.append("image", file);
    const { res, data } = await apiForm("/api/uploads/product-image", fd);
    setUploadingColor("");
    if (!res.ok) {
      setError(data?.message || `Upload failed for ${color}`);
      return;
    }
    onChange(setColorImageUrl(normalized, color, data.imageUrl));
  }

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4">
      <p className="text-sm font-semibold text-slate-900">Photos by color</p>
      <p className="mt-1 text-xs text-slate-600">
        Add one image per color ({colors.length} color{colors.length === 1 ? "" : "s"} = up to{" "}
        {colors.length} image{colors.length === 1 ? "" : "s"}). On the shop, the photo changes when
        the customer picks a color.
      </p>

      {error ? (
        <p className="mt-2 text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        {colors.map((color) => {
          const url = urlByColor[color];
          const busy = uploadingColor === color;
          const hex = colorSwatchHex(color);
          return (
            <div
              key={color}
              className="flex flex-col gap-3 rounded-lg border border-white bg-white p-3 shadow-sm sm:flex-row sm:items-start"
            >
              <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                <span
                  className="inline-block h-5 w-5 rounded-full border border-slate-300"
                  style={{ backgroundColor: hex }}
                  aria-hidden
                />
                <span className="text-sm font-semibold text-slate-900">{color}</span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={`${color} product`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-slate-400">
                      No photo
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    className={inputClass}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      void uploadForColor(color, file);
                      e.target.value = "";
                    }}
                  />
                  {busy ? (
                    <p className="text-xs text-sky-800">Uploading…</p>
                  ) : url ? (
                    <button
                      type="button"
                      onClick={() => onChange(removeColorImage(normalized, color))}
                      className="self-start text-xs font-medium text-red-700 hover:underline"
                    >
                      Remove photo
                    </button>
                  ) : (
                    <p className="text-xs text-amber-800">Required before save</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

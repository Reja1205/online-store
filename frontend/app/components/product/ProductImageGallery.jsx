"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { colorSwatchHex } from "../../lib/colors";
import {
  getColorGalleryEntries,
  getProductImageForColor,
} from "../../lib/colorImages";

function isAllowedImageHost(src) {
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return false;
    return ["res.cloudinary.com", "images.unsplash.com", "placehold.co"].includes(u.hostname);
  } catch {
    return false;
  }
}

function GalleryImage({ src, alt, className = "", priority = false }) {
  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400 ${className}`}
      >
        No image
      </div>
    );
  }
  if (isAllowedImageHost(src)) {
    return (
      <span className={`relative block h-full w-full ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain p-2"
          sizes="480px"
          priority={priority}
        />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`h-full w-full object-contain p-2 ${className}`} />
  );
}

export default function ProductImageGallery({
  product,
  name,
  colors = [],
  selectedColor,
  onColorSelect,
}) {
  const entries = useMemo(() => getColorGalleryEntries(product), [product]);
  const activeUrl = getProductImageForColor(product, selectedColor);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!entries.length) return;
    const idx = entries.findIndex((e) => e.color === (selectedColor || ""));
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [selectedColor, entries]);

  const mainUrl = entries[activeIndex]?.imageUrl || activeUrl;

  function selectEntry(index) {
    setActiveIndex(index);
    const entry = entries[index];
    if (entry?.color && onColorSelect) onColorSelect(entry.color);
  }

  function selectColor(color) {
    onColorSelect?.(color);
    const idx = entries.findIndex((e) => e.color === color);
    if (idx >= 0) setActiveIndex(idx);
  }

  return (
    <div className="flex gap-3">
      <div className="flex w-12 shrink-0 flex-col gap-2 sm:w-14">
        {entries.length ? (
          entries.map((entry, i) => (
            <button
              key={entry.color || `img-${i}`}
              type="button"
              onClick={() => selectEntry(i)}
              className={`relative aspect-square w-full overflow-hidden rounded-md border bg-white transition ${
                activeIndex === i
                  ? "border-sky-600 ring-1 ring-sky-600"
                  : "border-slate-200 hover:border-slate-400"
              }`}
              aria-label={entry.color ? `View ${entry.color}` : "View product"}
              aria-current={activeIndex === i}
            >
              <GalleryImage src={entry.imageUrl} alt="" className="!p-0" />
            </button>
          ))
        ) : (
          <div className="aspect-square rounded-md border border-slate-200 bg-slate-50" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 gap-2">
        <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-lg border border-slate-100 bg-white sm:min-h-[360px] lg:min-h-[420px]">
          <GalleryImage src={mainUrl} alt={name} priority />
        </div>

        {colors.length > 0 ? (
          <div className="flex w-10 shrink-0 flex-col gap-2 sm:w-12" aria-label="Select color">
            {colors.map((color) => {
              const hex = colorSwatchHex(color);
              const active = selectedColor === color;
              const thumbUrl = getProductImageForColor(product, color);
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => selectColor(color)}
                  className={`relative aspect-[3/4] w-full overflow-hidden rounded border-2 bg-white transition ${
                    active ? "border-sky-600 ring-1 ring-sky-500" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {thumbUrl ? (
                    <GalleryImage src={thumbUrl} alt={color} className="!p-0" />
                  ) : (
                    <span
                      className="absolute inset-1 rounded-sm"
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

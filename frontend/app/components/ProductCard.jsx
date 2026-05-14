"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { productName, productPrice, productStock } from "../lib/api";

function isAllowedImageHost(src) {
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return false;
    const allowed = ["res.cloudinary.com", "images.unsplash.com", "placehold.co"];
    return allowed.includes(u.hostname);
  } catch {
    return false;
  }
}

function ProductCard({ p, user, onAddToCart }) {
  const name = productName(p);
  const price = productPrice(p);
  const stock = productStock(p);

  const canAdd = !!user && stock > 0;
  const useNextImage = p.imageUrl && isAllowedImageHost(p.imageUrl);

  const stockBadgeClass =
    stock > 0
      ? "bg-emerald-500/95 text-white ring-1 ring-emerald-600/20"
      : "bg-rose-500/95 text-white ring-1 ring-rose-700/20";

  const detailHref = `/products/${p._id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <Link
        href={detailHref}
        className="relative block w-full cursor-pointer overflow-hidden bg-slate-50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
        aria-label={`View ${name}`}
      >
        <div className="relative aspect-[4/3] w-full sm:aspect-[4/3]">
          {p.imageUrl ? (
            useNextImage ? (
              <Image
                src={p.imageUrl}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary merchant image hosts
              <img
                src={p.imageUrl}
                alt={name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
              No image
            </div>
          )}
        </div>

        <span
          className={`pointer-events-none absolute right-3 top-3 z-10 inline-flex max-w-[calc(100%-1.5rem)] items-center truncate rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-[2px] ${stockBadgeClass}`}
        >
          {stock > 0 ? `In stock · ${stock}` : "Out of stock"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={detailHref}
          className="block cursor-pointer rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
        >
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{name}</h3>

          <p className="text-lg font-semibold tracking-tight text-indigo-600">${price}</p>

          {p.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{p.description}</p>
          ) : null}
        </Link>

        <div className="mt-auto flex gap-2 pt-2">
          <Link
            href={detailHref}
            className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-100 min-h-[2.75rem]"
          >
            Details
          </Link>

          <button
            type="button"
            onClick={() => onAddToCart(p._id)}
            disabled={!canAdd}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition min-h-[2.75rem] ${
              canAdd
                ? "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
            title={
              !user ? "Sign in to add items" : stock <= 0 ? "Out of stock" : "Add to cart"
            }
            aria-label={canAdd ? `Add ${name} to cart` : undefined}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);

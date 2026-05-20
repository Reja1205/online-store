"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import {
  productDisplayPrice,
  productIsOnSale,
  productName,
  productPrice,
} from "../lib/api";
import { productHasColors } from "../lib/colors";
import { productCardBlurb, productReviewSummary } from "../lib/productCard";
import { productHasSizes, productTotalStock } from "../lib/sizes";
import StarRating from "./product/StarRating";

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
  const displayPrice = productDisplayPrice(p);
  const onSale = productIsOnSale(p);
  const blurb = productCardBlurb(p);
  const reviewSummary = productReviewSummary(p);
  const needsOptions = productHasSizes(p) || productHasColors(p);
  const stock = productTotalStock(p);
  const canAdd = stock > 0 && !needsOptions;
  const useNextImage = p.imageUrl && isAllowedImageHost(p.imageUrl);

  const stockBadgeClass =
    stock > 0
      ? "bg-emerald-500/95 text-white ring-1 ring-emerald-600/20"
      : "bg-rose-500/95 text-white ring-1 ring-rose-700/20";

  const detailHref = `/products/${p._id}`;

  return (
    <article className="group flex flex-row overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] md:flex-col md:hover:-translate-y-0.5 xl:rounded-lg">
      <Link
        href={detailHref}
        className="relative block w-[7.25rem] shrink-0 cursor-pointer overflow-hidden bg-slate-50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] sm:w-32 md:w-full"
        aria-label={`View ${name}`}
      >
        <div className="relative aspect-square w-full md:aspect-[4/3]">
          {p.imageUrl ? (
            useNextImage ? (
              <Image
                src={p.imageUrl}
                alt={name}
                fill
                sizes="(max-width: 768px) 128px, (max-width: 1024px) 33vw, 16vw"
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
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
              No image
            </div>
          )}
        </div>

        {onSale ? (
          <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm md:left-2 md:top-2 md:px-2 md:text-[10px]">
            Sale
          </span>
        ) : null}
        <span
          className={`pointer-events-none absolute bottom-1.5 right-1.5 z-10 inline-flex max-w-[calc(100%-0.5rem)] items-center truncate rounded-full px-1.5 py-0.5 text-[9px] font-semibold shadow-sm backdrop-blur-[2px] md:right-2 md:top-2 md:bottom-auto md:px-2 md:text-[10px] ${stockBadgeClass}`}
        >
          {stock > 0 ? `In stock · ${stock}` : "Out of stock"}
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-2.5 sm:p-3 md:gap-1.5 xl:gap-1 xl:p-2">
        <Link
          href={detailHref}
          className="block min-w-0 cursor-pointer rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
        >
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 md:line-clamp-2 xl:line-clamp-1 xl:text-xs">
            {name}
          </h3>

          <p className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-semibold tracking-tight text-indigo-600 sm:text-sm xl:text-sm">
              ${displayPrice.toFixed(2)}
            </span>
            {onSale ? (
              <span className="text-xs text-slate-400 line-through xl:text-[10px]">
                ${price.toFixed(2)}
              </span>
            ) : null}
          </p>

          <div className="mt-1 flex flex-col gap-1 sm:gap-1.5 md:mt-1.5 md:grid md:grid-cols-2 md:items-start md:gap-2">
            <div className="min-w-0">
              {blurb ? (
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 md:line-clamp-3">
                  {blurb}
                </p>
              ) : (
                <p className="text-xs text-slate-400">No description</p>
              )}
            </div>
            <div className="min-w-0 md:flex md:justify-end">
              <StarRating
                rating={reviewSummary.averageRating}
                count={reviewSummary.count}
                size="sm"
                className="justify-start md:justify-end"
              />
            </div>
          </div>
        </Link>

        <div className="mt-auto flex gap-1.5 pt-0.5 md:pt-1 xl:gap-1 xl:pt-0.5">
          <Link
            href={detailHref}
            className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-xs font-medium text-slate-800 transition hover:bg-slate-100 min-h-[2.25rem] md:min-h-[2.25rem] xl:min-h-[1.75rem] xl:rounded-md xl:py-1 xl:text-[10px]"
          >
            Details
          </Link>

          {needsOptions ? (
            <Link
              href={detailHref}
              className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-indigo-600 py-2 text-center text-xs font-semibold text-white transition hover:bg-indigo-700 min-h-[2.25rem] xl:min-h-[1.75rem] xl:rounded-md xl:py-1 xl:text-[10px]"
              title="Select size and color on product page"
            >
              Add
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(p._id)}
              disabled={!canAdd}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition min-h-[2.25rem] xl:min-h-[1.75rem] xl:rounded-md xl:py-1 xl:text-[10px] ${
                canAdd
                  ? "cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
              title={stock <= 0 ? "Out of stock" : "Add to cart"}
              aria-label={canAdd ? `Add ${name} to cart` : undefined}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);

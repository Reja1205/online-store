"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "./ui/Skeleton";
import { PRODUCT_GRID_CLASS } from "../lib/productGrid";

export default function ProductSection({
  id,
  title,
  subtitle,
  viewAllHref,
  products = [],
  loading = false,
  user,
  onAddToCart,
  accent = "indigo",
}) {
  if (!loading && products.length === 0) return null;

  const accentRing =
    accent === "amber"
      ? "ring-amber-200/80"
      : accent === "rose"
        ? "ring-rose-200/80"
        : "ring-indigo-200/80";

  return (
    <section id={id} className="scroll-mt-28 space-y-5" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id={`${id}-heading`}
            className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
          >
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="inline-flex min-h-[2.5rem] items-center text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            View all →
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className={PRODUCT_GRID_CLASS}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div
          className={`${PRODUCT_GRID_CLASS} rounded-2xl p-1 ring-1 ${accentRing}`}
        >
          {products.map((p) => (
            <ProductCard key={p._id} p={p} user={user} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}

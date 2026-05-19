"use client";

import Link from "next/link";
import { productDisplayPrice, productIsOnSale, productName, productPrice } from "../../lib/api";
import { getCategoryLabel } from "../../lib/categories";

function formatPrice(n) {
  return `$${Number(n).toFixed(2)}`;
}

export default function SimilarProductsCompare({ currentProduct, similarProducts = [] }) {
  const currentId = String(currentProduct?._id || "");
  const currentPrice = productDisplayPrice(currentProduct);
  const currentName = productName(currentProduct);

  const rows = (similarProducts || []).filter((p) => String(p._id) !== currentId).slice(0, 6);

  if (!rows.length) {
    return (
      <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-600">
        <h2 className="font-semibold text-slate-900">Compare with similar items</h2>
        <p className="mt-1">No similar products in this category yet.</p>
      </section>
    );
  }

  const allPrices = [currentPrice, ...rows.map((p) => productDisplayPrice(p))];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="compare-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="compare-heading" className="text-sm font-semibold text-slate-900">
            Compare with similar items
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Same category
            {currentProduct?.category
              ? `: ${getCategoryLabel(currentProduct.category)}`
              : ""}{" "}
            · {formatPrice(minPrice)} – {formatPrice(maxPrice)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            currentPrice <= minPrice
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {currentPrice <= minPrice ? "Best price in group" : "Compare before you buy"}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3 font-medium">Product</th>
              <th className="py-2 pr-3 font-medium">Price</th>
              <th className="py-2 pr-3 font-medium">vs this item</th>
              <th className="py-2 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-indigo-100 bg-indigo-50/50">
              <td className="py-2.5 pr-3 font-medium text-slate-900">
                {currentName}
                <span className="ml-1 text-xs font-normal text-indigo-600">(this item)</span>
              </td>
              <td className="py-2.5 pr-3 font-semibold text-indigo-700">{formatPrice(currentPrice)}</td>
              <td className="py-2.5 pr-3 text-slate-600">—</td>
              <td className="py-2.5 text-slate-400">Viewing</td>
            </tr>
            {rows.map((p) => {
              const price = productDisplayPrice(p);
              const diff = price - currentPrice;
              const onSale = productIsOnSale(p);
              return (
                <tr key={p._id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pr-3 text-slate-900">
                    {productName(p)}
                    {onSale ? (
                      <span className="ml-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800">
                        Sale
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-slate-800">
                    {formatPrice(price)}
                    {onSale && productPrice(p) > price ? (
                      <span className="ml-1 text-xs text-slate-400 line-through">
                        {formatPrice(productPrice(p))}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={`py-2.5 pr-3 font-medium ${
                      diff < 0 ? "text-emerald-700" : diff > 0 ? "text-rose-700" : "text-slate-600"
                    }`}
                  >
                    {diff === 0
                      ? "Same price"
                      : diff < 0
                        ? `${formatPrice(Math.abs(diff))} less`
                        : `${formatPrice(diff)} more`}
                  </td>
                  <td className="py-2.5">
                    <Link
                      href={`/products/${p._id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

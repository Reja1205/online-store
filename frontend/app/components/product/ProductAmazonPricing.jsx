"use client";

import {
  formatMoneyUSD,
  productDiscountLabel,
  productDisplayPrice,
  productHasDiscount,
  productPrice,
} from "../../lib/api";
import { getPromotionLabel } from "../../lib/promotions";

export default function ProductAmazonPricing({ product, className = "" }) {
  if (!product) return null;

  const regular = productPrice(product);
  const display = productDisplayPrice(product);
  const discounted = productHasDiscount(product);
  const label = productDiscountLabel(product);
  const pct =
    discounted && regular > 0 ? Math.round((1 - display / regular) * 100) : 0;
  const promoName = product.promotionCategory
    ? getPromotionLabel(product.promotionCategory)
    : "";

  return (
    <div className={`space-y-1 ${className}`}>
      {discounted && pct > 0 ? (
        <p className="text-sm font-medium text-rose-700">-{pct}%</p>
      ) : null}
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-normal text-slate-900">{formatMoneyUSD(display)}</span>
        {discounted ? (
          <span className="text-sm text-slate-600">
            List Price:{" "}
            <span className="line-through">{formatMoneyUSD(regular)}</span>
          </span>
        ) : null}
      </div>
      {promoName ? (
        <p className="text-sm text-amber-900">
          <span className="font-semibold">{promoName}</span>
          {label ? ` · ${label}` : null}
        </p>
      ) : null}
      <p className="text-sm text-sky-700 hover:underline cursor-pointer">FREE Returns</p>
    </div>
  );
}

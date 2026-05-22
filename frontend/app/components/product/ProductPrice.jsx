"use client";

import {
  formatMoneyUSD,
  productDiscountLabel,
  productDisplayPrice,
  productHasDiscount,
  productPrice,
} from "../../lib/api";
import { getPromotionLabel } from "../../lib/promotions";

const sizeStyles = {
  sm: {
    price: "text-base font-semibold tracking-tight text-indigo-600 sm:text-sm xl:text-sm",
    was: "text-xs text-slate-400 line-through xl:text-[10px]",
    badge: "rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white md:px-2 md:text-[10px]",
    promo: "text-[10px] font-medium text-amber-800 xl:text-[9px]",
  },
  md: {
    price: "text-lg font-semibold tracking-tight text-indigo-600",
    was: "text-sm text-slate-400 line-through",
    badge: "rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white",
    promo: "text-xs font-medium text-amber-800",
  },
  lg: {
    price: "text-3xl font-semibold text-slate-900",
    was: "text-sm text-slate-500 line-through",
    badge: "rounded bg-rose-700 px-2 py-0.5 text-xs font-bold text-white",
    promo: "text-sm font-medium text-amber-900",
  },
};

export default function ProductPrice({
  product,
  size = "md",
  showBadge = true,
  showPromotionName = false,
  className = "",
}) {
  if (!product) return null;

  const regular = productPrice(product);
  const display = productDisplayPrice(product);
  const discounted = productHasDiscount(product);
  const label = productDiscountLabel(product);
  const styles = sizeStyles[size] || sizeStyles.md;
  const promoName = product.promotionCategory
    ? getPromotionLabel(product.promotionCategory)
    : "";

  return (
    <div className={`flex flex-wrap items-baseline gap-1.5 ${className}`}>
      <span className={styles.price}>{formatMoneyUSD(display)}</span>
      {discounted ? (
        <span className={styles.was}>{formatMoneyUSD(regular)}</span>
      ) : null}
      {showBadge && discounted && label ? (
        <span className={styles.badge}>{label}</span>
      ) : null}
      {showPromotionName && promoName ? (
        <span className={styles.promo}>{promoName}</span>
      ) : null}
    </div>
  );
}

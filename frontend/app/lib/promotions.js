/** Promotion campaigns — separate from department categories (mens, women, etc.). */
export const PROMOTION_PARENT_LABEL = "Promotions";

export const PROMOTION_CATEGORIES = [
  { value: "all", label: "All promotions" },
  { value: "summer-sale", label: "Summer Sale" },
  { value: "winter-sale", label: "Winter Sale" },
  { value: "memorial-day-sale", label: "Memorial Day Sale" },
  { value: "black-friday-sale", label: "Black Friday Sale" },
  { value: "special-sale", label: "Special Sale" },
  { value: "clearance", label: "Clearance" },
];

/** Subcategories for admin assignment (excludes “All”). */
export const ADMIN_PROMOTION_CATEGORIES = PROMOTION_CATEGORIES.filter((c) => c.value !== "all");

/** Discount % options when a promotion is selected (must match backend). */
export const PROMOTION_PERCENT_OPTIONS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90,
];

export function formatPromotionPercent(percent) {
  const n = Number(percent);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${n}% off`;
}

export function getPromotionLabel(value) {
  if (!value) return "";
  const found = PROMOTION_CATEGORIES.find((c) => c.value === value);
  return found?.label ?? value;
}

export function normalizePromotionSlug(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  if (!key || key === "all") return "all";
  return ADMIN_PROMOTION_CATEGORIES.some((c) => c.value === key) ? key : key;
}

export function isValidPromotionSlug(value) {
  return ADMIN_PROMOTION_CATEGORIES.some((c) => c.value === value);
}

export function productMatchesPromotion(product, promoSlug) {
  const have = String(product?.promotionCategory || "").trim().toLowerCase();
  if (!have) return false;
  const want = normalizePromotionSlug(promoSlug);
  if (!want || want === "all") return true;
  return have === want;
}

export function pickPromotionProducts(products, promoSlug = "all") {
  const list = Array.isArray(products) ? products : [];
  return list.filter((p) => productMatchesPromotion(p, promoSlug));
}

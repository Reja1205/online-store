/** Promotion campaign slugs (must match frontend app/lib/promotions.js). */
const PROMOTION_CATEGORY_SLUGS = [
  "summer-sale",
  "winter-sale",
  "memorial-day-sale",
  "black-friday-sale",
  "special-sale",
  "clearance",
];

const SLUG_SET = new Set(PROMOTION_CATEGORY_SLUGS);

/** Allowed promotion discount percentages (must match frontend). */
const PROMOTION_PERCENT_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90];

const PERCENT_SET = new Set(PROMOTION_PERCENT_OPTIONS);

function normalizePromotionSlug(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  if (!key || key === "none" || key === "all") return "";
  if (SLUG_SET.has(key)) return key;
  return key;
}

function isValidPromotionCategory(slug) {
  const normalized = normalizePromotionSlug(slug);
  return Boolean(normalized) && SLUG_SET.has(normalized);
}

function parsePromotionPercent(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n);
}

function isValidPromotionPercent(percent) {
  return percent != null && PERCENT_SET.has(percent);
}

module.exports = {
  PROMOTION_CATEGORY_SLUGS,
  PROMOTION_PERCENT_OPTIONS,
  isValidPromotionCategory,
  isValidPromotionPercent,
  normalizePromotionSlug,
  parsePromotionPercent,
};

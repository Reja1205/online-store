const { isMensDepartmentSlug, normalizeCategorySlug } = require("./categories");

const ADULT_SIZE_CATEGORIES = new Set(["mens", "women"]);
const CHILD_SIZE_CATEGORIES = new Set(["kids", "child"]);

const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const CHILD_SIZES = [
  "0-3 months",
  "3-6 months",
  "6-12 months",
  "12-18 months",
  "18-24 months",
  "2-3 years",
  "3-4 years",
  "4-5 years",
  "5-6 years",
  "6-7 years",
  "7-8 years",
  "8-10 years",
  "10-12 years",
];

function getCategorySizeMode(category) {
  const slug = normalizeCategorySlug(category);
  if (ADULT_SIZE_CATEGORIES.has(slug) || isMensDepartmentSlug(slug)) return "adult";
  if (CHILD_SIZE_CATEGORIES.has(slug)) return "child";
  return null;
}

function getSizesForCategory(category) {
  const mode = getCategorySizeMode(category);
  if (mode === "adult") return [...ADULT_SIZES];
  if (mode === "child") return [...CHILD_SIZES];
  return [];
}

function isValidSizeForCategory(category, size) {
  const allowed = getSizesForCategory(category);
  return allowed.includes(String(size || "").trim());
}

function isValidSizeForProduct(product, size) {
  const s = String(size || "").trim();
  if (!s) return false;
  const offered = product?.sizes;
  if (!Array.isArray(offered) || offered.length === 0) return false;
  return offered.includes(s);
}

/** Parse admin payload: [{ size, stock }] or legacy string list */
function parseSizeStockPayload(body, category) {
  const mode = getCategorySizeMode(category);
  if (!mode) return { sizes: [], sizeStock: [] };

  let raw = body?.sizeStock ?? body?.sizes;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  if (!Array.isArray(raw)) return { sizes: [], sizeStock: [] };

  const sizeStock = [];
  for (const entry of raw) {
    if (typeof entry === "string") {
      const size = entry.trim();
      if (isValidSizeForCategory(category, size)) {
        sizeStock.push({ size, stock: 0 });
      }
      continue;
    }
    const size = String(entry?.size ?? "").trim();
    if (!isValidSizeForCategory(category, size)) continue;
    const stock = Math.max(0, Number(entry?.stock ?? 0) || 0);
    sizeStock.push({ size, stock });
  }

  const sizes = sizeStock.map((s) => s.size);
  return { sizes, sizeStock };
}

function totalStockFromSizeStock(sizeStock, fallback = 0) {
  if (!Array.isArray(sizeStock) || sizeStock.length === 0) return fallback;
  return sizeStock.reduce((sum, s) => sum + Number(s.stock || 0), 0);
}

module.exports = {
  ADULT_SIZES,
  CHILD_SIZES,
  getCategorySizeMode,
  getSizesForCategory,
  isValidSizeForCategory,
  isValidSizeForProduct,
  parseSizeStockPayload,
  totalStockFromSizeStock,
};

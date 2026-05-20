import { normalizeCategorySlug } from "./categories";

export const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const CHILD_SIZES = [
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

const ADULT_CATEGORIES = new Set(["mens", "women"]);
const CHILD_CATEGORIES = new Set(["kids", "child"]);

export function getCategorySizeMode(category) {
  const slug = normalizeCategorySlug(category);
  if (ADULT_CATEGORIES.has(slug)) return "adult";
  if (CHILD_CATEGORIES.has(slug)) return "child";
  return null;
}

export function getSizesForCategory(category) {
  const mode = getCategorySizeMode(category);
  if (mode === "adult") return ADULT_SIZES;
  if (mode === "child") return CHILD_SIZES;
  return [];
}

export function productHasSizes(product) {
  return Array.isArray(product?.sizes) && product.sizes.length > 0;
}

export function productSizeOptions(product) {
  if (!productHasSizes(product)) return [];
  return product.sizes;
}

export function stockForSize(product, size) {
  const list = product?.sizeStock;
  if (Array.isArray(list) && list.length > 0 && size) {
    const row = list.find((s) => s.size === size);
    if (row) return Number(row.stock || 0);
  }
  return Number(product?.stock ?? 0) || 0;
}

export function productTotalStock(product) {
  const list = product?.sizeStock;
  if (Array.isArray(list) && list.length > 0) {
    return list.reduce((sum, s) => sum + Number(s.stock || 0), 0);
  }
  return Number(product?.stock ?? 0) || 0;
}

export function defaultSizeStockForCategory(category) {
  return getSizesForCategory(category).map((size) => ({ size, stock: 0 }));
}

export function sizeStockFromProduct(p) {
  if (Array.isArray(p?.sizeStock) && p.sizeStock.length > 0) {
    return p.sizeStock.map((s) => ({
      size: s.size,
      stock: Number(s.stock ?? 0),
    }));
  }
  if (Array.isArray(p?.sizes) && p.sizes.length > 0) {
    const per = Math.floor(Number(p.stock ?? 0) / p.sizes.length);
    return p.sizes.map((size) => ({ size, stock: per }));
  }
  return [];
}

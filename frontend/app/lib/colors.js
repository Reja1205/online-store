import { isMensDepartmentSlug, normalizeCategorySlug } from "./categories";
import { getCategorySizeMode } from "./sizes";

export const CLOTHING_COLORS = [
  "Black",
  "White",
  "Navy",
  "Gray",
  "Beige",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Pink",
];

const COLOR_HEX = {
  Black: "#1f2937",
  White: "#f8fafc",
  Navy: "#1e3a5f",
  Gray: "#9ca3af",
  Beige: "#d4b896",
  Red: "#dc2626",
  Blue: "#2563eb",
  Green: "#16a34a",
  Brown: "#78350f",
  Pink: "#ec4899",
};

export function getCategoryColorMode(category) {
  const slug = normalizeCategorySlug(category);
  if (
    ["mens", "women", "kids", "child"].includes(slug) ||
    isMensDepartmentSlug(slug) ||
    getCategorySizeMode(category)
  ) {
    return "clothing";
  }
  return null;
}

export function getColorsForCategory(category) {
  return getCategoryColorMode(category) ? CLOTHING_COLORS : [];
}

/** True only when admin saved at least one color on the product */
export function productHasColors(product) {
  return Array.isArray(product?.colors) && product.colors.length > 0;
}

/** Colors shoppers can pick — only what admin enabled on this product */
export function productColorOptions(product) {
  if (!productHasColors(product)) return [];
  return product.colors;
}

export function colorSwatchHex(name) {
  return COLOR_HEX[name] || "#cbd5e1";
}

export function defaultColorsForCategory(category) {
  if (!getCategoryColorMode(category)) return [];
  return ["Black", "White", "Navy"].filter((c) => CLOTHING_COLORS.includes(c));
}

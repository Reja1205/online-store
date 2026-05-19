import { productIsOnSale } from "./api";

/** Match homepage product grid (8 per row on xl) */
export const SECTION_LIMIT = 8;

/** MongoDB / API may return boolean or string flags on older rows */
export function isTruthyFlag(product, key) {
  const v = product?.[key];
  return v === true || v === "true" || v === 1 || v === "1";
}

function sortByRecent(a, b) {
  const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
  const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
  return tb - ta;
}

export function pickBestSellers(products) {
  const flagged = products.filter((p) => isTruthyFlag(p, "bestSeller")).sort(sortByRecent);
  if (flagged.length) return flagged.slice(0, SECTION_LIMIT);
  return [...products].sort(sortByRecent).slice(0, SECTION_LIMIT);
}

export function pickFeatured(products) {
  const flagged = products.filter((p) => isTruthyFlag(p, "featured")).sort(sortByRecent);
  if (flagged.length) return flagged.slice(0, SECTION_LIMIT);
  return products.filter((p) => !isTruthyFlag(p, "bestSeller")).sort(sortByRecent).slice(0, SECTION_LIMIT);
}

export function pickOnSale(products) {
  const flagged = products
    .filter((p) => isTruthyFlag(p, "onSale") || productIsOnSale(p))
    .sort(sortByRecent);
  if (flagged.length) return flagged.slice(0, SECTION_LIMIT);
  return [];
}

export function filterBySection(products, section) {
  if (section === "best-seller") return products.filter((p) => isTruthyFlag(p, "bestSeller"));
  if (section === "featured") return products.filter((p) => isTruthyFlag(p, "featured"));
  if (section === "sale") return products.filter((p) => isTruthyFlag(p, "onSale") || productIsOnSale(p));
  return products;
}

export function productHomepageSections(product) {
  const sections = [];
  if (isTruthyFlag(product, "bestSeller")) sections.push("Best Sellers");
  if (isTruthyFlag(product, "featured")) sections.push("Featured");
  if (isTruthyFlag(product, "onSale") || productIsOnSale(product)) sections.push("Special Sale");
  return sections;
}

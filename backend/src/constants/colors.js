const { isMensDepartmentSlug, normalizeCategorySlug } = require("./categories");
const { getCategorySizeMode } = require("./sizes");

const CLOTHING_COLOR_CATEGORIES = new Set(["mens", "women", "kids", "child"]);

const CLOTHING_COLORS = [
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

function getCategoryColorMode(category) {
  const slug = normalizeCategorySlug(category);
  if (
    CLOTHING_COLOR_CATEGORIES.has(slug) ||
    isMensDepartmentSlug(slug) ||
    getCategorySizeMode(category)
  ) {
    return "clothing";
  }
  return null;
}

function getColorsForCategory(category) {
  return getCategoryColorMode(category) ? [...CLOTHING_COLORS] : [];
}

function isValidColorForCategory(category, color) {
  return getColorsForCategory(category).includes(String(color || "").trim());
}

function isValidColorForProduct(product, color) {
  const c = String(color || "").trim();
  if (!c) return false;
  const offered = product?.colors;
  if (!Array.isArray(offered) || offered.length === 0) return false;
  return offered.includes(c);
}

function parseColorsPayload(body, category) {
  const mode = getCategoryColorMode(category);
  if (!mode) return [];

  let raw = body?.colors;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = raw.split(",").map((s) => s.trim());
    }
  }
  if (!Array.isArray(raw)) return [];

  const colors = [];
  for (const entry of raw) {
    const color = typeof entry === "string" ? entry.trim() : String(entry?.color ?? "").trim();
    if (color && isValidColorForCategory(category, color) && !colors.includes(color)) {
      colors.push(color);
    }
  }
  return colors;
}

module.exports = {
  CLOTHING_COLORS,
  getCategoryColorMode,
  getColorsForCategory,
  isValidColorForCategory,
  isValidColorForProduct,
  parseColorsPayload,
};

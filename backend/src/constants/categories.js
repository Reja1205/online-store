/** Men's sub-departments (must match frontend app/lib/categories.js). */
const MENS_SUBCATEGORY_SLUGS_LIST = [
  "mens",
  "mens-tshirt",
  "mens-sweatshirt",
  "mens-jacket",
  "mens-pants",
  "mens-shoes",
];

const MENS_SUB_ONLY = new Set(
  MENS_SUBCATEGORY_SLUGS_LIST.filter((s) => s !== "mens")
);

/** Allowed product category slugs (must match frontend app/lib/categories.js). */
const PRODUCT_CATEGORY_SLUGS = [
  "mens",
  "mens-tshirt",
  "mens-sweatshirt",
  "mens-jacket",
  "mens-pants",
  "mens-shoes",
  "women",
  "kids",
  "child",
  "arts-crafts",
  "automotive",
  "baby",
  "beauty",
  "books",
  "computers",
  "electronics",
  "fashion",
  "garden",
  "grocery",
  "health",
  "home-kitchen",
  "industrial",
  "movies-tv",
  "music",
  "office",
  "pets",
  "software",
  "sports",
  "tools",
  "toys",
  "video-games",
];

const SLUG_SET = new Set(PRODUCT_CATEGORY_SLUGS);

const CATEGORY_SLUG_ALIASES = {
  women: "women",
  womens: "women",
  "women's": "women",
  mens: "mens",
  "men's": "mens",
  men: "mens",
  "mens-t-shirt": "mens-tshirt",
  "mens-t-shirts": "mens-tshirt",
  "mens-sweatshirts": "mens-sweatshirt",
  "mens-jackets": "mens-jacket",
  "mens-pant": "mens-pants",
  "mens-shoe": "mens-shoes",
  kids: "kids",
  kid: "kids",
  "kids'": "kids",
  child: "child",
  children: "child",
};

function normalizeCategorySlug(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  if (!key) return "";
  if (CATEGORY_SLUG_ALIASES[key]) return CATEGORY_SLUG_ALIASES[key];
  if (SLUG_SET.has(key)) return key;
  return key;
}

function isValidCategory(slug) {
  const normalized = normalizeCategorySlug(slug);
  return Boolean(normalized) && SLUG_SET.has(normalized);
}

function isMensDepartmentSlug(slug) {
  const normalized = normalizeCategorySlug(slug);
  return normalized === "mens" || MENS_SUB_ONLY.has(normalized);
}

function getCategoryMatchValues(canonicalSlug) {
  const slug = normalizeCategorySlug(canonicalSlug);
  if (!slug || !SLUG_SET.has(slug)) return [];
  if (slug === "mens") {
    return [...MENS_SUBCATEGORY_SLUGS_LIST];
  }
  const variants = new Set([slug]);
  for (const [alias, canonical] of Object.entries(CATEGORY_SLUG_ALIASES)) {
    if (canonical === slug) variants.add(alias);
  }
  return [...variants];
}

module.exports = {
  PRODUCT_CATEGORY_SLUGS,
  MENS_SUBCATEGORY_SLUGS_LIST,
  isMensDepartmentSlug,
  isValidCategory,
  normalizeCategorySlug,
  getCategoryMatchValues,
};

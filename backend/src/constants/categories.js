/** Allowed product category slugs (must match frontend app/lib/categories.js). */
const PRODUCT_CATEGORY_SLUGS = [
  "mens",
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

function getCategoryMatchValues(canonicalSlug) {
  const slug = normalizeCategorySlug(canonicalSlug);
  if (!slug || !SLUG_SET.has(slug)) return [];
  const variants = new Set([slug]);
  for (const [alias, canonical] of Object.entries(CATEGORY_SLUG_ALIASES)) {
    if (canonical === slug) variants.add(alias);
  }
  return [...variants];
}

module.exports = {
  PRODUCT_CATEGORY_SLUGS,
  isValidCategory,
  normalizeCategorySlug,
  getCategoryMatchValues,
};

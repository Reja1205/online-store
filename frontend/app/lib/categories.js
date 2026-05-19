/** Store browse categories (Amazon-style department list). */
export const PRODUCT_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "mens", label: "Men's" },
  { value: "women", label: "Women's" },
  { value: "kids", label: "Kids" },
  { value: "child", label: "Child" },
  { value: "arts-crafts", label: "Arts & Crafts" },
  { value: "automotive", label: "Automotive" },
  { value: "baby", label: "Baby" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "books", label: "Books" },
  { value: "computers", label: "Computers" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "garden", label: "Garden & Outdoor" },
  { value: "grocery", label: "Grocery" },
  { value: "health", label: "Health & Household" },
  { value: "home-kitchen", label: "Home & Kitchen" },
  { value: "industrial", label: "Industrial & Scientific" },
  { value: "movies-tv", label: "Movies & TV" },
  { value: "music", label: "Music" },
  { value: "office", label: "Office Products" },
  { value: "pets", label: "Pet Supplies" },
  { value: "software", label: "Software" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "tools", label: "Tools & Home Improvement" },
  { value: "toys", label: "Toys & Games" },
  { value: "video-games", label: "Video Games" },
];

export function getCategoryLabel(value) {
  const found = PRODUCT_CATEGORIES.find((c) => c.value === value);
  return found?.label ?? value;
}

/** Categories for admin product forms (excludes “All”). */
export const ADMIN_CATEGORIES = PRODUCT_CATEGORIES.filter((c) => c.value !== "all");

export function isValidCategorySlug(value) {
  return ADMIN_CATEGORIES.some((c) => c.value === value);
}

/** Maps labels / legacy values to canonical slugs (e.g. "Women's" → "women"). */
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

export function normalizeCategorySlug(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase();
  if (!key || key === "all") return "all";
  if (CATEGORY_SLUG_ALIASES[key]) return CATEGORY_SLUG_ALIASES[key];
  if (isValidCategorySlug(key)) return key;
  return key;
}

/** All DB values that should match a canonical category slug. */
export function getCategoryMatchValues(canonicalSlug) {
  const slug = normalizeCategorySlug(canonicalSlug);
  if (slug === "all") return [];
  const variants = new Set([slug]);
  for (const [alias, canonical] of Object.entries(CATEGORY_SLUG_ALIASES)) {
    if (canonical === slug) variants.add(alias);
  }
  return [...variants];
}

export function productMatchesCategory(product, categorySlug) {
  if (!categorySlug || categorySlug === "all") return true;
  const want = normalizeCategorySlug(categorySlug);
  const have = normalizeCategorySlug(product?.category);
  return have === want;
}

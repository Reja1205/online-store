/** Men's sub-departments (assign products here in admin). */
export const MENS_SUBCATEGORIES = [
  { value: "mens", label: "All Men's" },
  { value: "mens-tshirt", label: "Men's T-Shirt" },
  { value: "mens-sweatshirt", label: "Men's Sweatshirt" },
  { value: "mens-jacket", label: "Men's Jacket" },
  { value: "mens-pants", label: "Men's Pants" },
  { value: "mens-shoes", label: "Men's Shoes" },
];

const MENS_SUBCATEGORY_SLUGS = new Set(
  MENS_SUBCATEGORIES.map((c) => c.value).filter((v) => v !== "mens")
);

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
  const slug = normalizeCategorySlug(value);
  const fromMens = MENS_SUBCATEGORIES.find((c) => c.value === slug);
  if (fromMens) return fromMens.label;
  const found = PRODUCT_CATEGORIES.find((c) => c.value === slug);
  return found?.label ?? value;
}

/** Categories for admin product forms (includes men's subcategories). */
export const ADMIN_CATEGORIES = [
  ...PRODUCT_CATEGORIES.filter((c) => c.value !== "all" && c.value !== "mens"),
  ...MENS_SUBCATEGORIES,
];

const OTHER_DEPARTMENTS = PRODUCT_CATEGORIES.filter(
  (c) => c.value !== "all" && c.value !== "mens"
);

/** Shop dropdown: All + Men's optgroup + other departments */
export const CATEGORY_SELECT_OPTIONS = [
  { value: "all", label: "All" },
  { label: "Men's", options: MENS_SUBCATEGORIES },
  ...OTHER_DEPARTMENTS.map((c) => ({ value: c.value, label: c.label })),
];

/** Admin product form — Men's subcategories + other departments (no “All”) */
export const ADMIN_CATEGORY_SELECT_OPTIONS = [
  { label: "Men's", options: MENS_SUBCATEGORIES },
  ...OTHER_DEPARTMENTS.map((c) => ({ value: c.value, label: c.label })),
];

const VALID_CATEGORY_SLUGS = new Set(ADMIN_CATEGORIES.map((c) => c.value));

export function isMensDepartmentSlug(slug) {
  const normalized = normalizeCategorySlug(slug);
  return normalized === "mens" || MENS_SUBCATEGORY_SLUGS.has(normalized);
}

export function isValidCategorySlug(value) {
  const normalized = normalizeCategorySlug(value);
  if (normalized === "all") return true;
  return VALID_CATEGORY_SLUGS.has(normalized);
}

/** Maps labels / legacy values to canonical slugs (e.g. "Women's" → "women"). */
const CATEGORY_SLUG_ALIASES = {
  women: "women",
  womens: "women",
  "women's": "women",
  mens: "mens",
  "men's": "mens",
  men: "mens",
  "mens-t-shirt": "mens-tshirt",
  "mens-t-shirts": "mens-tshirt",
  "mens-tee": "mens-tshirt",
  "mens-sweatshirts": "mens-sweatshirt",
  "mens-jackets": "mens-jacket",
  "mens-pant": "mens-pants",
  "mens-pants": "mens-pants",
  "mens-shoe": "mens-shoes",
  "mens-shoes": "mens-shoes",
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
  if (VALID_CATEGORY_SLUGS.has(key)) return key;
  return key;
}

/** All DB values that should match a canonical category slug. */
export function getCategoryMatchValues(canonicalSlug) {
  const slug = normalizeCategorySlug(canonicalSlug);
  if (slug === "all") return [];
  if (slug === "mens") {
    return [
      "mens",
      ...MENS_SUBCATEGORIES.map((c) => c.value).filter((v) => v !== "mens"),
    ];
  }
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
  if (want === "mens") return isMensDepartmentSlug(have);
  return have === want;
}

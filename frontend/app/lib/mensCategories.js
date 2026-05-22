import {
  getCategoryLabel,
  isMensDepartmentSlug,
  MENS_SUBCATEGORIES,
  normalizeCategorySlug,
} from "./categories";

export { MENS_SUBCATEGORIES, isMensDepartmentSlug };

export function MensSubcategoryNav({ activeSlug, onSelect, className = "" }) {
  const active = normalizeCategorySlug(activeSlug);

  const chip =
    "shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-[13px]";
  const chipIdle = `${chip} border-indigo-200 bg-white text-indigo-950 hover:border-indigo-300 hover:bg-indigo-50`;
  const chipActive = `${chip} border-indigo-700 bg-indigo-600 text-white shadow-sm`;

  return (
    <nav
      className={`flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain scrollbar-none pb-1 ${className}`}
      aria-label="Men's categories"
    >
      {MENS_SUBCATEGORIES.map((c) => {
        const isActive = active === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onSelect(c.value)}
            className={isActive ? chipActive : chipIdle}
            aria-current={isActive ? "page" : undefined}
          >
            {c.label}
          </button>
        );
      })}
    </nav>
  );
}

export function getMensPageTitle(categorySlug) {
  const slug = normalizeCategorySlug(categorySlug);
  if (slug === "mens") return "Men's";
  if (isMensDepartmentSlug(slug) && slug !== "mens") {
    return getCategoryLabel(slug);
  }
  return "Men's";
}

/**
 * Resolve product image URLs for display.
 * Relative /product-images/ paths only work locally; production uses Cloudinary HTTPS URLs.
 */
export function resolveProductImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!trimmed.startsWith("/")) return trimmed;

  const base =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "";

  if (!base) return trimmed;
  return `${base.replace(/\/$/, "")}${trimmed}`;
}

export function isRelativeProductImagePath(url) {
  return typeof url === "string" && url.startsWith("/product-images/");
}

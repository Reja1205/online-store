/** Text shown under the product name on catalog cards */
export function productCardBlurb(product) {
  const short = String(product?.shortDescription || "").trim();
  if (short) return short;

  const full = String(product?.description || "").trim();
  if (!full) return "";
  if (full.length <= 120) return full;
  return `${full.slice(0, 117)}…`;
}

export function productReviewSummary(product) {
  return product?.reviewSummary || { count: 0, averageRating: 0 };
}

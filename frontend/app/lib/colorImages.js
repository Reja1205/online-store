/** One photo per color — when the shopper picks a color, the main image updates. */

export function normalizeColorImageRow(row) {
  if (!row?.color) return null;
  const color = String(row.color).trim();
  let imageUrl = "";
  if (Array.isArray(row.imageUrls) && row.imageUrls[0]) {
    imageUrl = String(row.imageUrls[0]);
  } else if (row.imageUrl) {
    imageUrl = String(row.imageUrl);
  }
  if (!color || !imageUrl) return null;
  return { color, imageUrl };
}

export function normalizeColorImagesList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  for (const row of list) {
    const norm = normalizeColorImageRow(row);
    if (!norm || seen.has(norm.color)) continue;
    seen.add(norm.color);
    out.push(norm);
  }
  return out;
}

export function getProductImageForColor(product, color) {
  if (!product) return "";
  const key = String(color || "").trim();
  if (key && Array.isArray(product.colorImages)) {
    const row = normalizeColorImagesList(product.colorImages).find((e) => e.color === key);
    if (row?.imageUrl) return row.imageUrl;
  }
  return product.imageUrl || "";
}

/** Left thumbnails: one per color that has a photo. */
export function getColorGalleryEntries(product) {
  const entries = normalizeColorImagesList(product?.colorImages || []);
  if (entries.length) {
    return entries.map((row) => ({ color: row.color, imageUrl: row.imageUrl }));
  }
  if (product?.imageUrl) {
    return [{ color: "", imageUrl: product.imageUrl }];
  }
  return [];
}

export function pruneColorImages(colorImages, colors) {
  const allowed = new Set(colors || []);
  return normalizeColorImagesList(colorImages).filter((row) => allowed.has(row.color));
}

export function setColorImageUrl(colorImages, color, imageUrl) {
  const list = normalizeColorImagesList(colorImages);
  const idx = list.findIndex((r) => r.color === color);
  const row = { color, imageUrl };
  const next = [...list];
  if (idx >= 0) next[idx] = row;
  else next.push(row);
  return next;
}

export function removeColorImage(colorImages, color) {
  return normalizeColorImagesList(colorImages).filter((row) => row.color !== color);
}

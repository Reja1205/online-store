function normalizeEntry(entry) {
  if (!entry?.color) return null;
  const color = String(entry.color).trim();
  let imageUrl = "";
  if (Array.isArray(entry.imageUrls) && entry.imageUrls[0]) {
    imageUrl = String(entry.imageUrls[0]).trim();
  } else if (entry.imageUrl) {
    imageUrl = String(entry.imageUrl).trim();
  }
  if (!color || !imageUrl) return null;
  return { color, imageUrl };
}

function parseColorImagesPayload(body) {
  let raw = body?.colorImages;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const entry of raw) {
    const norm = normalizeEntry(entry);
    if (!norm || seen.has(norm.color)) continue;
    seen.add(norm.color);
    out.push(norm);
  }
  return out;
}

function applyColorImages(body, target) {
  const parsed = parseColorImagesPayload(body);
  const allowed = new Set(Array.isArray(target.colors) ? target.colors : []);
  const filtered =
    allowed.size > 0 ? parsed.filter((entry) => allowed.has(entry.color)) : parsed;

  target.colorImages = filtered;

  if (filtered.length > 0) {
    const matchDefault = target.colors?.[0]
      ? filtered.find((e) => e.color === target.colors[0])
      : null;
    const primary = matchDefault || filtered[0];
    target.imageUrl = primary.imageUrl || "";
  }
}

function getImageUrlForColor(product, color) {
  if (!product) return "";
  const key = String(color || "").trim();
  if (key && Array.isArray(product.colorImages)) {
    for (const entry of product.colorImages) {
      if (entry.color !== key) continue;
      if (entry.imageUrl) return entry.imageUrl;
      if (Array.isArray(entry.imageUrls) && entry.imageUrls[0]) return entry.imageUrls[0];
    }
  }
  return product.imageUrl || "";
}

module.exports = {
  parseColorImagesPayload,
  applyColorImages,
  getImageUrlForColor,
};

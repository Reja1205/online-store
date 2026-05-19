const STORAGE_KEY = "wc_wishlist";

export function readGuestWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function writeGuestWishlist(ids) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids.map(String))]));
}

export function isInGuestWishlist(productId) {
  return readGuestWishlist().includes(String(productId));
}

export function toggleGuestWishlist(productId) {
  const id = String(productId);
  const list = readGuestWishlist();
  const has = list.includes(id);
  const next = has ? list.filter((x) => x !== id) : [...list, id];
  writeGuestWishlist(next);
  window.dispatchEvent(new Event("wishlist:updated"));
  return !has;
}

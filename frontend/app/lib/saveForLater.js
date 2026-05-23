const STORAGE_KEY = "online-store:save-for-later";

export function loadSaveForLater() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addSaveForLater(item) {
  const list = loadSaveForLater();
  const key = `${item.productId}::${item.size || ""}::${item.color || ""}`;
  const next = [
    { ...item, savedAt: Date.now() },
    ...list.filter(
      (row) =>
        `${row.productId}::${row.size || ""}::${row.color || ""}` !== key
    ),
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.length;
}

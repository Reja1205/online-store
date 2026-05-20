const GUEST_KEY = "guestId";

function createGuestId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Stable anonymous session id for cart/checkout without an account. */
export function getGuestId() {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = createGuestId();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

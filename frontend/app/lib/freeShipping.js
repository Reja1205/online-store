import { normalizeCategorySlug } from "./categories";

/** Buy this many men's t-shirts in one order → free delivery (must match backend). */
export const MENS_TSHIRT_FREE_SHIPPING_MIN_QTY = 5;

export function isMensTshirtProduct(product) {
  return normalizeCategorySlug(product?.category) === "mens-tshirt";
}

/** Count men's t-shirt units from cart rows `{ product, qty }`. */
export function countMensTshirtQtyFromRows(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((sum, row) => {
    if (!isMensTshirtProduct(row?.product)) return sum;
    return sum + Math.max(1, Number(row.qty || 1));
  }, 0);
}

export function qualifiesMensTshirtFreeShipping(mensTshirtQty) {
  return Number(mensTshirtQty) >= MENS_TSHIRT_FREE_SHIPPING_MIN_QTY;
}

export function mensTshirtFreeShippingHeadline(mensTshirtQty) {
  if (qualifiesMensTshirtFreeShipping(mensTshirtQty)) {
    return "FREE delivery — 5+ men's t-shirts in cart";
  }
  const need = Math.max(0, MENS_TSHIRT_FREE_SHIPPING_MIN_QTY - Number(mensTshirtQty || 0));
  if (need === 0) return "FREE delivery available";
  return `Add ${need} more men's t-shirt${need === 1 ? "" : "s"} for FREE delivery`;
}

export function mensTshirtFreeShippingNote(mensTshirtQty) {
  if (qualifiesMensTshirtFreeShipping(mensTshirtQty)) {
    return `Your cart has ${mensTshirtQty} men's t-shirt${
      mensTshirtQty === 1 ? "" : "s"
    }. Standard and express delivery are FREE on this order.`;
  }
  const need = Math.max(0, MENS_TSHIRT_FREE_SHIPPING_MIN_QTY - Number(mensTshirtQty || 0));
  if (Number(mensTshirtQty) > 0) {
    return `You have ${mensTshirtQty} men's t-shirt${
      mensTshirtQty === 1 ? "" : "s"
    }. Add ${need} more for FREE delivery on the whole order.`;
  }
  return `Buy any ${MENS_TSHIRT_FREE_SHIPPING_MIN_QTY} men's t-shirts in one order for FREE delivery (standard & express).`;
}

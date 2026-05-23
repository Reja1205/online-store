import { getCategoryLabel, normalizeCategorySlug } from "./categories";
import { weeklyFreeDeliveryLabel } from "./weeklyDelivery";

/** Buy this many men's t-shirts in one order → free delivery (must match backend). */
export const MENS_TSHIRT_FREE_SHIPPING_MIN_QTY = 5;

/** Order subtotal for free standard shipping (must match backend checkout). */
export const ORDER_FREE_SHIPPING_MIN_USD = 35;

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

/** Dominant category in cart by line quantity. */
export function getPrimaryCartCategoryLabel(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const totals = new Map();
  for (const row of rows) {
    if (!row?.product?.category) continue;
    const slug = normalizeCategorySlug(row.product.category);
    totals.set(slug, (totals.get(slug) || 0) + Math.max(1, Number(row.qty || 1)));
  }
  let top = null;
  for (const [slug, qty] of totals) {
    if (!top || qty > top.qty) top = { slug, qty };
  }
  return top ? getCategoryLabel(top.slug) : null;
}

/**
 * Cart summary banner — only shows men's t-shirt promo when cart has men's t-shirts.
 * Other categories get weekly delivery + order-min shipping messaging.
 */
export function getCartSummaryPromo(rows, subtotal = 0) {
  const mensTshirtQty = countMensTshirtQtyFromRows(rows);
  const total = Number(subtotal) || 0;
  const categoryLabel = getPrimaryCartCategoryLabel(rows);

  if (qualifiesMensTshirtFreeShipping(mensTshirtQty)) {
    return {
      tone: "success",
      headline: mensTshirtFreeShippingHeadline(mensTshirtQty),
      note: mensTshirtFreeShippingNote(mensTshirtQty),
      checkoutShippingFree: true,
    };
  }

  if (mensTshirtQty > 0) {
    return {
      tone: "info",
      headline: mensTshirtFreeShippingHeadline(mensTshirtQty),
      note: mensTshirtFreeShippingNote(mensTshirtQty),
      checkoutShippingFree: false,
    };
  }

  const weekly = weeklyFreeDeliveryLabel();
  const orderMinMet = total >= ORDER_FREE_SHIPPING_MIN_USD;
  const needForOrderMin = Math.max(0, ORDER_FREE_SHIPPING_MIN_USD - total);

  if (orderMinMet) {
    return {
      tone: "success",
      headline: "FREE standard shipping on this order",
      note: `${weekly}. ${categoryLabel ? `Your cart is ${categoryLabel}. ` : ""}FREE returns on eligible items.`,
      checkoutShippingFree: true,
    };
  }

  const noteParts = [weekly];
  if (categoryLabel) {
    noteParts.push(`Your cart is ${categoryLabel}.`);
  }
  if (needForOrderMin > 0) {
    noteParts.push(
      `Add $${needForOrderMin.toFixed(2)} more for free standard shipping on orders over $${ORDER_FREE_SHIPPING_MIN_USD}.`
    );
  }
  noteParts.push("FREE returns on eligible items.");

  return {
    tone: "info",
    headline: weekly,
    note: noteParts.join(" "),
    checkoutShippingFree: false,
  };
}

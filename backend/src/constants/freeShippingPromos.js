const { normalizeCategorySlug } = require("./categories");

/** Buy this many men's t-shirts in one order → free delivery (all shipping methods). */
const MENS_TSHIRT_FREE_SHIPPING_MIN_QTY = Number(
  process.env.MENS_TSHIRT_FREE_SHIPPING_MIN_QTY || 5
);

function isMensTshirtCategory(category) {
  return normalizeCategorySlug(category) === "mens-tshirt";
}

function countMensTshirtQty(cartItems, productsById) {
  if (!cartItems?.length) return 0;
  let total = 0;
  for (const ci of cartItems) {
    const pid = String(ci.product?._id || ci.product || "");
    const p = productsById?.get?.(pid);
    if (!p || !isMensTshirtCategory(p.category)) continue;
    total += Math.max(1, Number(ci.qty || 1));
  }
  return total;
}

function qualifiesMensTshirtFreeShipping(mensTshirtQty) {
  return Number(mensTshirtQty) >= MENS_TSHIRT_FREE_SHIPPING_MIN_QTY;
}

module.exports = {
  MENS_TSHIRT_FREE_SHIPPING_MIN_QTY,
  isMensTshirtCategory,
  countMensTshirtQty,
  qualifiesMensTshirtFreeShipping,
};

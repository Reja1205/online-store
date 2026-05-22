const { isValidPromotionPercent } = require("../constants/promotions");

function regularPrice(product) {
  return Number(product?.price ?? 0) || 0;
}

function manualSalePrice(product) {
  const regular = regularPrice(product);
  const sale = Number(product?.salePrice);
  if (
    product?.onSale &&
    Number.isFinite(sale) &&
    sale >= 0 &&
    sale < regular
  ) {
    return sale;
  }
  return null;
}

function promotionSalePrice(product) {
  const regular = regularPrice(product);
  const slug = String(product?.promotionCategory || "").trim();
  const percent = Number(product?.promotionPercent);
  if (!slug || !isValidPromotionPercent(percent) || percent <= 0 || percent >= 100) {
    return null;
  }
  const discounted = regular * (1 - percent / 100);
  return Math.round(discounted * 100) / 100;
}

/** Lowest valid shopper price (manual sale vs promotion vs regular). */
function lineUnitPrice(product) {
  const regular = regularPrice(product);
  const candidates = [regular];
  const manual = manualSalePrice(product);
  const promo = promotionSalePrice(product);
  if (manual != null) candidates.push(manual);
  if (promo != null) candidates.push(promo);
  return Math.min(...candidates);
}

function hasDiscount(product) {
  return lineUnitPrice(product) < regularPrice(product);
}

module.exports = {
  regularPrice,
  manualSalePrice,
  promotionSalePrice,
  lineUnitPrice,
  hasDiscount,
};

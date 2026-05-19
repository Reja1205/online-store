import { productDisplayPrice } from "./api";

const FREE_SHIPPING_MIN = 35;

/**
 * Estimated delivery options for display on product detail (not a live carrier API).
 */
export function getDeliveryOptions(product) {
  const stock = Number(product?.stock ?? 0) || 0;
  const price = productDisplayPrice(product);

  if (stock <= 0) {
    return {
      inStock: false,
      headline: "Currently unavailable",
      options: [],
      note: "This item is out of stock. Delivery estimates apply when back in stock.",
    };
  }

  const freeShipping = price >= FREE_SHIPPING_MIN;

  return {
    inStock: true,
    headline: freeShipping ? "FREE delivery available" : "Fast delivery available",
    freeShippingMin: FREE_SHIPPING_MIN,
    qualifiesFreeShipping: freeShipping,
    options: [
      {
        id: "standard",
        label: "Standard shipping",
        eta: "3–5 business days",
        priceLabel: freeShipping ? "FREE" : "$5.99",
        highlight: true,
      },
      {
        id: "express",
        label: "Express shipping",
        eta: "1–2 business days",
        priceLabel: "$12.99",
        highlight: false,
      },
      {
        id: "pickup",
        label: "Store pickup",
        eta: "Ready in 24 hours",
        priceLabel: "FREE",
        highlight: false,
      },
    ],
    note: freeShipping
      ? `Orders over $${FREE_SHIPPING_MIN} qualify for free standard shipping.`
      : `Add $${(FREE_SHIPPING_MIN - price).toFixed(2)} more for free standard shipping.`,
  };
}

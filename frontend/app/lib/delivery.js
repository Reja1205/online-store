import { productDisplayPrice } from "./api";
import {
  isMensTshirtProduct,
  MENS_TSHIRT_FREE_SHIPPING_MIN_QTY,
  mensTshirtFreeShippingNote,
} from "./freeShipping";

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

  const orderMinFree = price >= FREE_SHIPPING_MIN;
  const mensTshirt = isMensTshirtProduct(product);

  if (mensTshirt) {
    return {
      inStock: true,
      headline: "FREE delivery when you buy 5",
      freeShippingMin: FREE_SHIPPING_MIN,
      mensTshirtFreeShippingMinQty: MENS_TSHIRT_FREE_SHIPPING_MIN_QTY,
      qualifiesFreeShipping: false,
      qualifiesMensTshirtPromo: true,
      options: [
        {
          id: "standard",
          label: "Standard shipping",
          eta: "3–5 business days",
          priceLabel: `FREE with ${MENS_TSHIRT_FREE_SHIPPING_MIN_QTY}+ in cart`,
          highlight: true,
        },
        {
          id: "express",
          label: "Express shipping",
          eta: "1–2 business days",
          priceLabel: `FREE with ${MENS_TSHIRT_FREE_SHIPPING_MIN_QTY}+ in cart`,
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
      note: mensTshirtFreeShippingNote(0),
    };
  }

  return {
    inStock: true,
    headline: orderMinFree ? "FREE delivery available" : "Fast delivery available",
    freeShippingMin: FREE_SHIPPING_MIN,
    qualifiesFreeShipping: orderMinFree,
    qualifiesMensTshirtPromo: false,
    options: [
      {
        id: "standard",
        label: "Standard shipping",
        eta: "3–5 business days",
        priceLabel: orderMinFree ? "FREE" : "$5.99",
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
    note: orderMinFree
      ? `Orders over $${FREE_SHIPPING_MIN} qualify for free standard shipping. Buy ${MENS_TSHIRT_FREE_SHIPPING_MIN_QTY} men's t-shirts in one order for free standard & express delivery.`
      : `Add $${(FREE_SHIPPING_MIN - price).toFixed(2)} more for free standard shipping, or buy ${MENS_TSHIRT_FREE_SHIPPING_MIN_QTY} men's t-shirts in one order for free delivery.`,
  };
}

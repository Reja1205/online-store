const FREE_SHIPPING_MIN_USD = Number(process.env.FREE_SHIPPING_MIN_USD || 35);

const SHIPPING_RATES = {
  standard: {
    id: "standard",
    label: "Standard shipping",
    eta: "3–5 business days",
    baseFee: Number(process.env.SHIPPING_STANDARD_USD || 5.99),
  },
  express: {
    id: "express",
    label: "Express shipping",
    eta: "1–2 business days",
    baseFee: Number(process.env.SHIPPING_EXPRESS_USD || 12.99),
  },
};

function calculateShippingFee(itemsTotal, shippingMethod = "standard") {
  const method = SHIPPING_RATES[shippingMethod] ? shippingMethod : "standard";
  const rate = SHIPPING_RATES[method];
  const subtotal = Number(itemsTotal) || 0;

  if (method === "standard" && subtotal >= FREE_SHIPPING_MIN_USD) {
    return {
      shippingMethod: method,
      shippingFee: 0,
      freeShippingApplied: true,
      label: rate.label,
      eta: rate.eta,
    };
  }

  return {
    shippingMethod: method,
    shippingFee: rate.baseFee,
    freeShippingApplied: false,
    label: rate.label,
    eta: rate.eta,
  };
}

function getShippingOptions(itemsTotal) {
  const subtotal = Number(itemsTotal) || 0;
  return Object.values(SHIPPING_RATES).map((rate) => {
    const calc = calculateShippingFee(subtotal, rate.id);
    return {
      id: rate.id,
      label: rate.label,
      eta: rate.eta,
      fee: calc.shippingFee,
      priceLabel: calc.shippingFee === 0 ? "FREE" : `$${calc.shippingFee.toFixed(2)}`,
      freeShippingApplied: calc.freeShippingApplied,
    };
  });
}

module.exports = {
  FREE_SHIPPING_MIN_USD,
  SHIPPING_RATES,
  calculateShippingFee,
  getShippingOptions,
};

const Product = require("../models/Product");
const { lineUnitPrice } = require("../utils/productPricing");

function availableStock(product, size) {
  const normalized = String(size || "").trim();
  const list = product.sizeStock;
  if (Array.isArray(list) && list.length > 0 && normalized) {
    const row = list.find((s) => s.size === normalized);
    return row ? Number(row.stock || 0) : 0;
  }
  return Number(product.stock ?? 0);
}

/** Validate cart lines against live product stock (before payment). */
function validateCartInventory(cartItems, productsById) {
  const errors = [];

  for (const ci of cartItems) {
    const pid = String(ci.product?._id || ci.product);
    const product = productsById.get(pid);
    const size = String(ci.size || "").trim();
    const qty = Math.max(1, Number(ci.qty || 1));

    if (!product) {
      errors.push(`Product ${pid} is no longer available`);
      continue;
    }

    const available = availableStock(product, size);
    if (available < qty) {
      const label = size ? `${product.name} (${size})` : product.name;
      errors.push(
        available <= 0
          ? `${label} is out of stock`
          : `Only ${available} left for ${label}`
      );
    }
  }

  return errors;
}

/** Decrement inventory after successful payment (call inside a transaction session). */
async function decrementInventory(lineItems, productsById, session) {
  for (const line of lineItems) {
    const pid = String(line.product);
    const product = productsById.get(pid);
    if (!product) continue;

    const size = String(line.size || "").trim();
    const qty = Math.max(1, Number(line.qty || 1));
    const list = product.sizeStock;

    if (Array.isArray(list) && list.length > 0 && size) {
      const idx = list.findIndex((s) => s.size === size);
      if (idx < 0) throw new Error(`Size ${size} not found for ${product.name}`);

      const current = Number(list[idx].stock || 0);
      if (current < qty) throw new Error(`Insufficient stock for ${product.name} (${size})`);

      list[idx].stock = current - qty;
      product.stock = list.reduce((sum, s) => sum + Number(s.stock || 0), 0);
      product.markModified("sizeStock");
      await product.save({ session });
    } else {
      const current = Number(product.stock ?? 0);
      if (current < qty) throw new Error(`Insufficient stock for ${product.name}`);
      product.stock = current - qty;
      await product.save({ session });
    }
  }
}

module.exports = {
  lineUnitPrice, // re-export for callers
  availableStock,
  validateCartInventory,
  decrementInventory,
};

const shippingAddressSchemaFields = {
  fullName: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address1: { type: String, default: "" },
  address2: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  country: { type: String, default: "" },
};

function normalizeShippingAddress(raw = {}) {
  const out = {};
  for (const key of Object.keys(shippingAddressSchemaFields)) {
    out[key] = String(raw[key] ?? "").trim();
  }
  return out;
}

function validateShippingAddress(addr) {
  const required = ["fullName", "email", "phone", "address1", "city", "postalCode", "country"];
  const missing = required.filter((k) => !addr[k]);
  if (missing.length) {
    return { ok: false, message: `Missing required fields: ${missing.join(", ")}` };
  }
  return { ok: true };
}

module.exports = {
  shippingAddressSchemaFields,
  normalizeShippingAddress,
  validateShippingAddress,
};

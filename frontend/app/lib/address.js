export const EMPTY_ADDRESS = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function normalizeAddress(raw = {}) {
  const out = { ...EMPTY_ADDRESS };
  for (const key of Object.keys(EMPTY_ADDRESS)) {
    if (raw[key] != null) out[key] = String(raw[key]).trim();
  }
  return out;
}

export function addressFromUser(user) {
  const saved = user?.shippingAddress;
  if (!saved || !Object.values(saved).some(Boolean)) {
    return normalizeAddress({
      fullName: user?.name || "",
      email: user?.email || "",
    });
  }
  return normalizeAddress({
    ...saved,
    fullName: saved.fullName || user?.name || "",
    email: saved.email || user?.email || "",
  });
}

export const ADDRESS_FIELDS = [
  ["fullName", "Full name", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone", "tel"],
  ["address1", "Address line 1", "text"],
  ["address2", "Address line 2 (optional)", "text"],
  ["city", "City", "text"],
  ["state", "State / region", "text"],
  ["postalCode", "Postal code", "text"],
  ["country", "Country", "text"],
];

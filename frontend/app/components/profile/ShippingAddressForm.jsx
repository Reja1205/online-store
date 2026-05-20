"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import { apiJson } from "../../lib/api";
import { ADDRESS_FIELDS, normalizeAddress } from "../../lib/address";

const autoByKey = {
  fullName: "name",
  email: "email",
  phone: "tel",
  address1: "address-line1",
  address2: "address-line2",
  city: "address-level2",
  state: "address-level1",
  postalCode: "postal-code",
  country: "country-name",
};

export default function ShippingAddressForm({ initialAddress, userEmail, onSaved }) {
  const [address, setAddress] = useState(() =>
    normalizeAddress({
      ...initialAddress,
      email: initialAddress?.email || userEmail || "",
    })
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAddress(normalizeAddress(initialAddress));
  }, [initialAddress]);

  async function save(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setSaving(true);

    const payload = normalizeAddress({
      ...address,
      email: address.email || userEmail || "",
    });

    const { res, data } = await apiJson("/api/auth/address", {
      method: "PUT",
      body: JSON.stringify({ shippingAddress: payload }),
    });

    setSaving(false);

    if (!res.ok) {
      setError(data?.message || "Could not save address");
      return;
    }

    setMsg("Address saved. It will auto-fill at checkout.");
    window.dispatchEvent(new Event("auth:changed"));
    onSaved?.(data?.user?.shippingAddress || payload);
  }

  return (
    <form onSubmit={save} className="rounded-xl border border-gray-100 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-gray-900">Shipping address</h2>
      <p className="mt-1 text-sm text-gray-600">
        Saved for checkout. You can change it when placing an order.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ADDRESS_FIELDS.map(([key, label, type]) => (
          <div
            key={key}
            className={key === "address1" || key === "address2" ? "sm:col-span-2" : ""}
          >
            <Label htmlFor={`profile-${key}`}>{label}</Label>
            <Input
              id={`profile-${key}`}
              type={type}
              value={address[key]}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="mt-1.5"
              autoComplete={autoByKey[key] || "on"}
            />
          </div>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {msg ? (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {msg}
        </p>
      ) : null}

      <div className="mt-4">
        <Button type="submit" variant="primary" size="md" disabled={saving}>
          {saving ? "Saving…" : "Save address"}
        </Button>
      </div>
    </form>
  );
}

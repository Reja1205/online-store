"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { apiJson } from "../lib/api";

const linkBtnSecondary =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md active:scale-[0.99]";

const linkBtnPrimary =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-brand-hover)] hover:shadow-md active:scale-[0.99]";

const linkBtnDark =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.99]";

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

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  async function loadPreview() {
    setError("");
    setMsg("");
    setLoading(true);

    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
      setLoading(false);
      return;
    }

    const { res, data } = await apiJson("/api/checkout/preview");

    if (res.status === 401) {
      router.push("/login");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setError(data?.message || "Failed to load checkout preview");
      setLoading(false);
      return;
    }

    setItems(Array.isArray(data.items) ? data.items : []);
    setItemsTotal(Number(data.itemsTotal || 0));
    setShippingFee(Number(data.shippingFee || 0));
    setTotalUSD(Number(data.totalUSD || 0));
    setLoading(false);
  }

  async function payNow() {
    setError("");
    setMsg("");
    setPaying(true);

    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
      setPaying(false);
      return;
    }

    const { res, data } = await apiJson("/api/checkout/pay", {
      method: "POST",
      body: JSON.stringify({ shippingAddress }),
    });

    if (res.status === 401) {
      router.push("/login");
      setPaying(false);
      return;
    }

    if (!res.ok) {
      setError(data?.message || "Payment failed");
      setPaying(false);
      return;
    }

    setMsg("Payment successful. Order created.");
    window.dispatchEvent(new Event("cart:updated"));
    setTimeout(() => router.push("/orders"), 650);
    setPaying(false);
  }

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formFields = useMemo(
    () => [
      ["fullName", "Full name", "text"],
      ["email", "Email", "email"],
      ["phone", "Phone", "tel"],
      ["address1", "Address line 1", "text"],
      ["address2", "Address line 2 (optional)", "text"],
      ["city", "City", "text"],
      ["state", "State / region", "text"],
      ["postalCode", "Postal code", "text"],
      ["country", "Country", "text"],
    ],
    []
  );

  const canPay =
    items.length > 0 &&
    shippingAddress.fullName.trim() &&
    shippingAddress.email.trim() &&
    shippingAddress.phone.trim() &&
    shippingAddress.address1.trim() &&
    shippingAddress.city.trim() &&
    shippingAddress.postalCode.trim() &&
    shippingAddress.country.trim();

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 py-6 sm:py-10">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" aria-hidden />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200/80" aria-hidden />
        <p className="sr-only">Loading checkout</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1>
          <p className="mt-1 text-sm text-slate-600">Review items and enter shipping details.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/cart" className={linkBtnSecondary}>
            Back to cart
          </Link>
          <Link href="/" className={linkBtnSecondary}>
            Home
          </Link>
          <Button type="button" variant="outlineDark" size="md" onClick={loadPreview}>
            Refresh
          </Button>
        </div>
      </div>

      {msg ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {msg}
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      {items.length === 0 ? (
        <Card>
          <p className="font-medium text-slate-900">Your cart is empty.</p>
          <p className="mt-1 text-sm text-slate-600">Add items before checking out.</p>
          <Link href="/products" className={`${linkBtnPrimary} mt-4 inline-flex`}>
            Browse products
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Shipping address</h2>
              <p className="mt-1 text-sm text-slate-600">
                Demo checkout — order is persisted on the server when you pay.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {formFields.map(([key, label, type]) => (
                  <div
                    key={key}
                    className={
                      key === "address1" || key === "address2" ? "sm:col-span-2" : ""
                    }
                  >
                    <Label htmlFor={`ship-${key}`}>{label}</Label>
                    <Input
                      id={`ship-${key}`}
                      type={type}
                      value={shippingAddress[key]}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={label}
                      className="mt-1.5"
                      autoComplete={autoByKey[key] || "on"}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Required: name, email, phone, address, city, postal code, country.
                </p>
                <Button type="button" variant="primary" size="lg" disabled={!canPay || paying} onClick={payNow}>
                  {paying ? "Processing…" : "Pay now (mock)"}
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((it, idx) => (
                  <li key={idx} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{it.name}</p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          ${Number(it.price || 0).toFixed(2)} × {it.qty}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900">
                        ${Number(it.lineTotal || 0).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items</span>
                  <span className="font-semibold text-slate-900">${itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-700">${totalUSD.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-900">Need changes?</h3>
              <p className="mt-1 text-sm text-slate-600">Update quantities or remove items in your cart.</p>
              <Link href="/cart" className={`${linkBtnDark} mt-3 inline-flex`}>
                Edit cart
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";
import {
  ADDRESS_FIELDS,
  EMPTY_ADDRESS,
  addressFromUser,
  normalizeAddress,
} from "../lib/address";

const linkBtnSecondary =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50";

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
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentProvider, setPaymentProvider] = useState("mock");
  const [integrations, setIntegrations] = useState(null);
  const [inventoryErrors, setInventoryErrors] = useState([]);
  const [freeShippingMin, setFreeShippingMin] = useState(35);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [cancelledMsg, setCancelledMsg] = useState("");

  const [shippingAddress, setShippingAddress] = useState(EMPTY_ADDRESS);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [addressPrefilled, setAddressPrefilled] = useState(false);

  const loadPreview = useCallback(async (method) => {
    setError("");
    setLoading(true);

    const { res, data } = await apiJson(
      `/api/checkout/preview?shippingMethod=${encodeURIComponent(method)}`
    );

    if (!res.ok) {
      setError(data?.message || "Failed to load checkout");
      setLoading(false);
      return;
    }

    setItems(Array.isArray(data.items) ? data.items : []);
    setItemsTotal(Number(data.itemsTotal || 0));
    setShippingFee(Number(data.shippingFee || 0));
    setTotalUSD(Number(data.totalUSD || 0));
    setShippingOptions(Array.isArray(data.shippingOptions) ? data.shippingOptions : []);
    setShippingMethod(data.shippingMethod || method);
    setPaymentProvider(data.paymentProvider || "mock");
    setInventoryErrors(Array.isArray(data.inventoryErrors) ? data.inventoryErrors : []);
    setFreeShippingMin(Number(data.freeShippingMin || 35));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (searchParams.get("cancelled")) {
      setCancelledMsg("Payment was cancelled. Your cart is still saved.");
    }
  }, [searchParams]);

  useEffect(() => {
    apiJson("/api/checkout/config").then(({ res, data }) => {
      if (res.ok) setIntegrations(data);
    });
  }, []);

  useEffect(() => {
    loadPreview(shippingMethod);
  }, [shippingMethod, loadPreview]);

  useEffect(() => {
    if (authLoading || !user || addressPrefilled) return;
    setShippingAddress(addressFromUser(user));
    setAddressPrefilled(true);
  }, [user, authLoading, addressPrefilled]);

  async function placeOrder() {
    setError("");
    setPaying(true);

    const { res, data } = await apiJson("/api/checkout/place-order", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress,
        shippingMethod,
        saveToProfile: user ? saveToProfile : false,
      }),
    });

    if (!res.ok) {
      setError(data?.message || "Could not place order");
      setPaying(false);
      return;
    }

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    const orderId = data?.order?._id;
    router.push(
      orderId
        ? `/checkout/confirmation?orderId=${encodeURIComponent(orderId)}`
        : "/checkout/confirmation"
    );
    setPaying(false);
  }

  const addressComplete =
    shippingAddress.fullName.trim() &&
    shippingAddress.email.trim() &&
    shippingAddress.phone.trim() &&
    shippingAddress.address1.trim() &&
    shippingAddress.city.trim() &&
    shippingAddress.postalCode.trim() &&
    shippingAddress.country.trim();

  const canPlace =
    items.length > 0 &&
    addressComplete &&
    inventoryErrors.length === 0 &&
    !paying;

  if (loading && items.length === 0 && !error) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 py-10">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" aria-hidden />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200/80" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6 overflow-x-clip py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Step 1: Address · Step 2: Shipping · Step 3: Payment
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/cart" className={linkBtnSecondary}>
            Back to cart
          </Link>
        </div>
      </div>

      {!user ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-900">
          Guest checkout — no account required.{" "}
          <Link href="/login" className="font-semibold underline">
            Sign in
          </Link>{" "}
          to save your address.
        </div>
      ) : null}

      {cancelledMsg ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {cancelledMsg}
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      {inventoryErrors.length > 0 ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-medium">Stock issue — update your cart:</p>
          <ul className="mt-2 list-disc pl-5">
            {inventoryErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <Link href="/cart" className="mt-2 inline-block font-semibold text-red-800 underline">
            Edit cart
          </Link>
        </div>
      ) : null}

      {items.length === 0 ? (
        <Card>
          <p className="font-medium text-slate-900">Your cart is empty.</p>
          <Link href="/products" className="mt-4 inline-flex text-indigo-600 hover:underline">
            Browse products
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">1. Shipping address</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ADDRESS_FIELDS.map(([key, label, type]) => (
                  <div
                    key={key}
                    className={key === "address1" || key === "address2" ? "sm:col-span-2" : ""}
                  >
                    <Label htmlFor={`ship-${key}`}>{label}</Label>
                    <Input
                      id={`ship-${key}`}
                      type={type}
                      value={shippingAddress[key]}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="mt-1.5"
                      autoComplete={autoByKey[key] || "on"}
                    />
                  </div>
                ))}
              </div>
              {user ? (
                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                  />
                  Save address to my profile
                </label>
              ) : null}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">2. Shipping method</h2>
              <p className="mt-1 text-xs text-slate-500">
                Free standard shipping on orders over ${freeShippingMin.toFixed(2)}.
              </p>
              <div className="mt-4 space-y-2">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                      shippingMethod === opt.id
                        ? "border-indigo-500 bg-indigo-50/80 ring-1 ring-indigo-500/30"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={opt.id}
                        checked={shippingMethod === opt.id}
                        onChange={() => setShippingMethod(opt.id)}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                        <p className="text-xs text-slate-500">{opt.eta}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{opt.priceLabel}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">3. Payment</h2>
              <p className="mt-1 text-sm text-slate-600">
                {paymentProvider === "stripe"
                  ? "You will be redirected to Stripe to pay securely."
                  : "Demo mode: payment is simulated and your order is confirmed immediately."}
              </p>
              {integrations ? (
                <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <li
                    className={`rounded-full px-2 py-0.5 ${
                      integrations.stripe ? "bg-emerald-100 text-emerald-800" : "bg-slate-100"
                    }`}
                  >
                    Stripe {integrations.stripe ? "on" : "off"}
                  </li>
                  <li
                    className={`rounded-full px-2 py-0.5 ${
                      integrations.email ? "bg-emerald-100 text-emerald-800" : "bg-slate-100"
                    }`}
                  >
                    Email {integrations.email ? "on" : "off"}
                  </li>
                  <li
                    className={`rounded-full px-2 py-0.5 ${
                      integrations.sms ? "bg-emerald-100 text-emerald-800" : "bg-slate-100"
                    }`}
                  >
                    SMS {integrations.sms ? "on" : "off"}
                  </li>
                </ul>
              ) : null}
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="mt-4 w-full sm:w-auto"
                disabled={!canPlace}
                onClick={placeOrder}
              >
                {paying
                  ? "Processing…"
                  : paymentProvider === "stripe"
                    ? `Pay $${totalUSD.toFixed(2)} with Stripe`
                    : `Place order — $${totalUSD.toFixed(2)}`}
              </Button>
            </Card>
          </div>

          <div>
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((it, idx) => (
                  <li key={idx} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-slate-900">{it.name}</span>
                      <span>${Number(it.lineTotal || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      ${Number(it.price || 0).toFixed(2)} × {it.qty}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-indigo-700">${totalUSD.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

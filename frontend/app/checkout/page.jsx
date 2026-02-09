"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
}

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

    try {
      const headers = authHeaders();
      if (!headers.Authorization) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API}/api/checkout/preview`, {
        headers,
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Failed to load checkout preview");
        return;
      }

      setItems(Array.isArray(data.items) ? data.items : []);
      setItemsTotal(Number(data.itemsTotal || 0));
      setShippingFee(Number(data.shippingFee || 0));
      setTotalUSD(Number(data.totalUSD || 0));
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function payNow() {
    setError("");
    setMsg("");
    setPaying(true);

    try {
      const headers = authHeaders();
      if (!headers.Authorization) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API}/api/checkout/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ shippingAddress }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Payment failed");
        return;
      }

      setMsg("Payment successful ✅ Order created!");
      window.dispatchEvent(new Event("cart:updated")); // ✅ cart badge updates
      setTimeout(() => router.push("/orders"), 650);
    } catch {
      setError("Network error");
    } finally {
      setPaying(false);
    }
  }

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formFields = useMemo(
    () => [
      ["fullName", "Full Name", "text"],
      ["email", "Email", "email"],
      ["phone", "Phone", "tel"],
      ["address1", "Address Line 1", "text"],
      ["address2", "Address Line 2 (optional)", "text"],
      ["city", "City", "text"],
      ["state", "State", "text"],
      ["postalCode", "Postal Code", "text"],
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-700">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-600 mt-1">
            Confirm your items and add shipping details.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/cart">
            <button className="rounded-xl bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              ← Back to Cart
            </button>
          </Link>

          <Link href="/">
            <button className="rounded-xl bg-white border px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Home
            </button>
          </Link>

          <button
            onClick={loadPreview}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {msg}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-700 font-medium">Your cart is empty.</p>
          <p className="text-sm text-gray-600 mt-1">
            Add items to your cart to continue checkout.
          </p>

          <Link href="/products">
            <button className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-semibold hover:bg-indigo-700">
              Browse Products
            </button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Address */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              <p className="text-sm text-gray-600 mt-1">
                This is a mock checkout, but the order will be saved.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formFields.map(([key, label, type]) => (
                  <div
                    key={key}
                    className={
                      key === "address1" || key === "address2"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={shippingAddress[key]}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={label}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-xs text-gray-500">
                  Required fields: name, email, phone, address, city, postal code, country.
                </div>

                <button
                  onClick={payNow}
                  disabled={!canPay || paying}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    !canPay || paying
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {paying ? "Processing..." : "Pay Now (Mock)"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

              <div className="mt-4 space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="rounded-xl border bg-gray-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{it.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          ${Number(it.price || 0).toFixed(2)} × {it.qty}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${Number(it.lineTotal || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Items total</span>
                  <span className="font-semibold text-gray-900">
                    ${itemsTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    ${shippingFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-extrabold text-indigo-700">
                    ${totalUSD.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                By clicking “Pay Now (Mock)”, you create an order and mark it paid in your system.
              </div>
            </div>

            <div className="mt-4 rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">Need to edit your cart?</h3>
              <p className="text-sm text-gray-600 mt-1">
                You can adjust items in the cart before checkout.
              </p>
              <Link href="/cart">
                <button className="mt-3 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                  Go to Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
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
        setLoading(false);
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
      // go to orders page
      setTimeout(() => router.push("/orders"), 600);
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

  if (loading) {
    return <div style={{ padding: 20 }}>Loading checkout...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>Checkout</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Link href="/cart">
          <button style={{ padding: 8, cursor: "pointer" }}>Back to Cart</button>
        </Link>
        <Link href="/">
          <button style={{ padding: 8, cursor: "pointer" }}>Home</button>
        </Link>
        <button onClick={loadPreview} style={{ padding: 8, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {msg && <p>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <h2>Order Summary</h2>

          <div style={{ display: "grid", gap: 10 }}>
            {items.map((it, idx) => (
              <div
                key={idx}
                style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b>{it.name}</b>
                  <span>
                    ${Number(it.price || 0).toFixed(2)} x {it.qty}
                  </span>
                </div>
                <div style={{ opacity: 0.85, marginTop: 6 }}>
                  Line total: ${Number(it.lineTotal || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <p style={{ margin: 0 }}>
              Items total: <b>${itemsTotal.toFixed(2)}</b>
            </p>
            <p style={{ margin: 0 }}>
              Shipping fee: <b>${shippingFee.toFixed(2)}</b>
            </p>
            <p style={{ margin: "8px 0 0 0" }}>
              Total: <b>${totalUSD.toFixed(2)}</b>
            </p>
          </div>

          <hr style={{ margin: "18px 0" }} />

          <h2>Shipping Address</h2>

          <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            {[
              ["fullName", "Full Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["address1", "Address Line 1"],
              ["address2", "Address Line 2 (optional)"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "Postal Code"],
              ["country", "Country"],
            ].map(([key, label]) => (
              <input
                key={key}
                placeholder={label}
                value={shippingAddress[key]}
                onChange={(e) =>
                  setShippingAddress((prev) => ({ ...prev, [key]: e.target.value }))
                }
                style={{ padding: 10 }}
              />
            ))}

            <button
              onClick={payNow}
              disabled={paying}
              style={{ padding: 10, cursor: "pointer" }}
            >
              {paying ? "Processing..." : "Pay Now (Mock)"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
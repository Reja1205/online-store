"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { apiJson } from "../../lib/api";
import { fmtMoney } from "../../lib/format";

export default function CheckoutConfirmationPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const sessionId = searchParams.get("session_id");
  const orderIdParam = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let pollTimer;

    async function load(attempt = 0) {
      if (attempt === 0) {
        setLoading(true);
        setError("");
      }

      const qs = sessionId
        ? `session_id=${encodeURIComponent(sessionId)}`
        : orderIdParam
          ? `orderId=${encodeURIComponent(orderIdParam)}`
          : "";

      if (!qs) {
        setError("Missing order reference");
        setLoading(false);
        return;
      }

      const { res, data } = await apiJson(`/api/checkout/confirm?${qs}`);

      if (cancelled) return;

      if (!res.ok) {
        setError(data?.message || "Could not load order confirmation");
        setLoading(false);
        return;
      }

      const o = data.order || null;
      setOrder(o);
      setNotifications(data.notifications || null);
      window.dispatchEvent(new Event("cart:updated"));

      const paid = o?.paymentStatus === "paid" || o?.status === "paid";
      if (sessionId && !paid && attempt < 12) {
        pollTimer = setTimeout(() => load(attempt + 1), 2000);
        setLoading(attempt === 0);
        return;
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [sessionId, orderIdParam]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200/80" aria-hidden />
        <p className="sr-only">Loading confirmation</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Card>
          <p className="font-medium text-red-700">{error || "Order not found"}</p>
          <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:underline">
            Continue shopping
          </Link>
        </Card>
      </div>
    );
  }

  const paid = order.paymentStatus === "paid" || order.status === "paid";

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
          }`}
        >
          {paid ? "✓" : "…"}
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          {paid ? "Order confirmed" : "Order received"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {paid
            ? notifications?.email?.sent
              ? "Thank you! A confirmation email has been sent."
              : notifications?.email?.configured
                ? "Thank you! We could not send the email — check the address or try again later."
                : notifications?.sms?.sent
                  ? "Thank you! A confirmation text has been sent."
                  : "Thank you! Your order is confirmed."
            : "Payment is being processed…"}
        </p>
        {paid && notifications?.sms?.sent ? (
          <p className="mt-1 text-xs text-slate-500">Confirmation SMS sent.</p>
        ) : null}
        {!paid && sessionId ? (
          <p className="mt-1 text-xs text-amber-700">Waiting for payment confirmation…</p>
        ) : null}
        <p className="mt-2 font-mono text-sm text-indigo-700">{order.orderNumber}</p>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(order.items || []).map((it, idx) => (
            <li key={idx} className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <span className="text-slate-700">
                {it.name} × {it.qty}
              </span>
              <span className="font-medium">${fmtMoney(it.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Items</span>
            <span>${fmtMoney(order.itemsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping ({order.shippingMethod || "standard"})</span>
            <span>${fmtMoney(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-indigo-700">${fmtMoney(order.totalUSD)}</span>
          </div>
        </div>
      </Card>

      {order.shippingAddress ? (
        <Card>
          <h2 className="font-semibold text-slate-900">Shipping to</h2>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">
            {order.shippingAddress.fullName}
            {"\n"}
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 ? `\n${order.shippingAddress.address2}` : ""}
            {"\n"}
            {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
              .filter(Boolean)
              .join(", ")}
            {"\n"}
            {order.shippingAddress.country}
          </p>
        </Card>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        {user ? (
          <Link href="/orders">
            <Button variant="primary" size="md">
              View my orders
            </Button>
          </Link>
        ) : null}
        <Link href="/products">
          <Button variant="outlineDark" size="md">
            Continue shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

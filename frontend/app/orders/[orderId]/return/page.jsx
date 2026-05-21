"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import { apiJson } from "../../../lib/api";

export default function RequestReturnPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = String(params?.orderId || "");

  const [eligibility, setEligibility] = useState(null);
  const [resolution, setResolution] = useState("refund");
  const [reason, setReason] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoading(true);
      setError("");
      const { res, data } = await apiJson(`/api/returns/eligibility/${orderId}`);
      if (res.status === 401) {
        router.replace(`/login?redirect=${encodeURIComponent(`/orders/${orderId}/return`)}`);
        return;
      }
      if (!res.ok) {
        setError(data?.message || "Could not load return eligibility");
        setLoading(false);
        return;
      }
      setEligibility(data.eligibility);
      setLoading(false);
    })();
  }, [orderId, router]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setSubmitting(true);

    try {
      const { res, data } = await apiJson("/api/returns", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          reason,
          resolution,
          customerNotes,
          policyAcknowledged,
        }),
      });

      if (!res.ok) {
        setError(data?.message || "Could not submit return");
        setSubmitting(false);
        return;
      }

      setMsg(data?.message || "Return request submitted.");
      setTimeout(() => router.replace("/orders"), 1200);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg p-6 text-sm text-slate-500" aria-busy="true">
        Loading return options…
      </div>
    );
  }

  if (!eligibility?.eligible) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card padding="p-6">
          <h1 className="text-xl font-semibold text-slate-900">Return not available</h1>
          <p className="mt-2 text-sm text-slate-600">{eligibility?.reason || error}</p>
          <Link href="/orders" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
            Back to my orders
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <Card padding="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Request a return</h1>
        <p className="mt-1 text-sm text-slate-600">
          {eligibility.returnWindowDays}-day return window ·{" "}
          {eligibility.daysRemaining} day{eligibility.daysRemaining === 1 ? "" : "s"} left
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <Label>What would you like?</Label>
            <div className="mt-2 grid gap-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                <input
                  type="radio"
                  name="resolution"
                  value="refund"
                  checked={resolution === "refund"}
                  onChange={() => setResolution("refund")}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-slate-900">Full refund</span>
                  <span className="block text-sm text-slate-600">Refund after we receive and inspect your return.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                <input
                  type="radio"
                  name="resolution"
                  value="replacement"
                  checked={resolution === "replacement"}
                  onChange={() => setResolution("replacement")}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-slate-900">Replace item</span>
                  <span className="block text-sm text-slate-600">We send a replacement after we receive your return.</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason for return</Label>
            <textarea
              id="reason"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
              placeholder="Describe the issue (size, defect, wrong item, etc.)"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional notes (optional)</Label>
            <Input
              id="notes"
              className="mt-1.5"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <input
              type="checkbox"
              checked={policyAcknowledged}
              onChange={(e) => setPolicyAcknowledged(e.target.checked)}
              className="mt-1"
              required
            />
            <span>
              I understand I must pay return shipping and items should be unused with tags attached. (
              {eligibility.shippingNotice})
            </span>
          </label>

          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {msg ? (
            <p role="status" className="text-sm text-emerald-700">
              {msg}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit return request"}
            </Button>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

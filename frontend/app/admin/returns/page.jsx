"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../../lib/api";
import { fmtDate } from "../../lib/format";

const STATUSES = ["pending", "approved", "received", "completed", "rejected", "cancelled"];

const NEXT_STATUS = {
  pending: [
    { value: "approved", label: "Approve" },
    { value: "rejected", label: "Reject" },
  ],
  approved: [{ value: "received", label: "Mark received" }],
  received: [{ value: "completed", label: "Complete" }],
};

function badgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return "bg-amber-100 text-amber-900 border-amber-200";
  if (s === "approved" || s === "received") return "bg-indigo-100 text-indigo-800 border-indigo-200";
  if (s === "completed") return "bg-green-100 text-green-800 border-green-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
    const { res, data } = await apiJson(`/api/returns${q}`, { cache: "no-store" });
    if (!res.ok) {
      setError(data?.message || "Failed to load returns");
      setReturns([]);
    } else {
      setReturns(Array.isArray(data?.returns) ? data.returns : []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id, status) {
    setBusyId(id);
    setMsg("");
    setError("");
    const { res, data } = await apiJson(`/api/returns/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, adminNotes: notes[id] || "" }),
    });
    setBusyId("");
    if (!res.ok) {
      setError(data?.message || "Update failed");
      return;
    }
    setMsg(data?.message || "Updated");
    await load();
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Return requests</h1>
            <p className="mt-1 text-sm text-gray-600">
              14-day window · Customer pays return shipping · Refund or replacement
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Admin home
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!filter ? "bg-indigo-600 text-white" : "bg-white border text-gray-700"}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${filter === s ? "bg-indigo-600 text-white" : "bg-white border text-gray-700"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        ) : null}
        {msg ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</p>
        ) : null}

        {loading ? (
          <p className="mt-6 text-gray-600">Loading…</p>
        ) : returns.length === 0 ? (
          <p className="mt-6 text-gray-600">No return requests.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {returns.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{r.returnNumber}</p>
                    <p className="text-sm text-gray-600">
                      Order {r.orderNumber} · {r.customerName || "Customer"} ({r.customerEmail})
                    </p>
                    <p className="text-xs text-gray-500">{fmtDate(r.createdAt)}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(r.status)}`}>
                    {String(r.status).toUpperCase()}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-800">
                  <strong>Resolution:</strong>{" "}
                  {r.resolution === "replacement" ? "Replacement" : "Full refund"}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  <strong>Reason:</strong> {r.reason}
                </p>
                {r.customerNotes ? (
                  <p className="mt-1 text-sm text-gray-600">
                    <strong>Customer notes:</strong> {r.customerNotes}
                  </p>
                ) : null}

                <ul className="mt-3 text-sm text-gray-700">
                  {(r.items || []).map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.qty}
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-gray-500">Admin notes</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    rows={2}
                    value={notes[r.id] ?? r.adminNotes ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Instructions or rejection reason"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(NEXT_STATUS[r.status] || []).map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void updateStatus(r.id, action.value)}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {busyId === r.id ? "Saving…" : action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

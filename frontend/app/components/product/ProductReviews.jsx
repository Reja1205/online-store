"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "../../lib/api";

function Stars({ rating, size = "md" }) {
  const cls = size === "sm" ? "text-sm" : "text-base";
  return (
    <span className={`inline-flex gap-0.5 text-amber-500 ${cls}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n}>{n <= Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export default function ProductReviews({ productId, user, initialSummary }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(initialSummary || { count: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    const { res, data } = await apiJson(`/api/products/${productId}/reviews`, { headers: {} });
    if (res.ok) {
      setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      if (data?.summary) setSummary(data.summary);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function submitReview(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!user) return;
    if (!comment.trim()) {
      setError("Please write a short review.");
      return;
    }

    setSubmitting(true);
    const { res, data } = await apiJson(`/api/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment: comment.trim() }),
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(data?.message || "Could not post review.");
      return;
    }

    setComment("");
    setRating(5);
    setMsg("Thank you! Your review was posted.");
    await loadReviews();
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="reviews-heading" className="text-sm font-semibold text-slate-900">
            Customer reviews
          </h2>
          {summary.count > 0 ? (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <Stars rating={summary.averageRating} />
              <span>
                {summary.averageRating} out of 5 · {summary.count} review
                {summary.count === 1 ? "" : "s"}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>

      {user ? (
        <form onSubmit={submitReview} className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Write a review</p>
          <label className="mt-2 block text-sm font-medium text-slate-700">
            Rating
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 block w-full max-w-[8rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2 block text-sm font-medium text-slate-700">
            Your review
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What did you like? How is the fit or quality?"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          {error ? (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {msg ? (
            <p role="status" className="mt-2 text-sm text-emerald-700">
              {msg}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-500">No reviews to show yet.</p>
        ) : (
          reviews.map((r) => (
            <article key={r._id} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <Stars rating={r.rating} size="sm" />
                <span className="text-sm font-medium text-slate-900">{r.userName}</span>
                <span className="text-xs text-slate-400">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{r.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

"use client";

function Star({ filled, half, className = "h-[1.125rem] w-[1.125rem] text-[1.125rem]" }) {
  if (half) {
    return (
      <span className={`relative inline-block leading-none text-amber-400 ${className}`} aria-hidden>
        <span className="absolute inset-0 overflow-hidden w-1/2">★</span>
        <span className="text-slate-200">★</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-block leading-none ${className} ${
        filled ? "text-amber-400" : "text-slate-200"
      }`}
      aria-hidden
    >
      ★
    </span>
  );
}

export function formatReviewCount(count) {
  const n = Number(count || 0);
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export default function StarRating({
  rating = 0,
  count = 0,
  size = "md",
  showCount = true,
  reviewHref,
  className = "",
}) {
  const avg = Math.min(5, Math.max(0, Number(rating) || 0));
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const diff = avg - i + 1;
    if (diff >= 1) stars.push({ filled: true, half: false });
    else if (diff >= 0.25) stars.push({ filled: false, half: true });
    else stars.push({ filled: false, half: false });
  }

  const textSize =
    size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";
  const starScale =
    size === "sm" ? "h-3.5 w-3.5 text-sm" : size === "lg" ? "h-5 w-5 text-xl" : "h-[1.125rem] w-[1.125rem] text-[1.125rem]";

  const countEl =
    showCount && count > 0 ? (
      reviewHref ? (
        <a
          href={reviewHref}
          className={`font-medium text-sky-700 hover:text-sky-900 hover:underline ${textSize}`}
        >
          {formatReviewCount(count)}
        </a>
      ) : (
        <span className={`text-slate-600 ${textSize}`}>({formatReviewCount(count)})</span>
      )
    ) : showCount ? (
      <span className={`text-slate-500 ${textSize}`}>No reviews yet</span>
    ) : null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5" role="img" aria-label={`${avg.toFixed(1)} out of 5 stars`}>
        {stars.map((s, i) => (
          <Star key={i} filled={s.filled} half={s.half} className={starScale} />
        ))}
      </div>
      {count > 0 ? (
        <span
          className={`font-semibold text-slate-900 ${
            size === "lg" ? "text-lg" : size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          {avg.toFixed(1)}
        </span>
      ) : null}
      {countEl}
    </div>
  );
}

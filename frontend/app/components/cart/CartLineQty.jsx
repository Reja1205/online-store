"use client";

function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3h6m-7 4h8m-9 4v9a2 2 0 002 2h6a2 2 0 002-2V11M10 11v6m4-6v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Amazon-style quantity control: pill with trash / qty / plus.
 */
export default function CartLineQty({
  qty,
  maxQty,
  disabled,
  busy,
  onDecrease,
  onIncrease,
  onRemove,
  ariaLabel,
}) {
  const atMax = qty >= maxQty;
  const decreaseIsRemove = qty <= 1;

  return (
    <div
      className={`inline-flex items-stretch overflow-hidden rounded-full border-2 border-amber-400 bg-white shadow-sm ${
        disabled || busy ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        disabled={disabled || busy}
        onClick={decreaseIsRemove ? onRemove : onDecrease}
        className="flex min-h-[2.125rem] min-w-[2.5rem] cursor-pointer items-center justify-center px-2 text-slate-800 transition hover:bg-amber-50 disabled:cursor-not-allowed"
        aria-label={decreaseIsRemove ? `Remove ${ariaLabel}` : `Decrease quantity for ${ariaLabel}`}
      >
        <TrashIcon />
      </button>
      <span
        className="flex min-w-[2.25rem] items-center justify-center border-x border-amber-300/80 px-2 text-sm font-semibold tabular-nums text-slate-900"
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        disabled={disabled || busy || atMax}
        onClick={onIncrease}
        className="flex min-h-[2.125rem] min-w-[2.5rem] cursor-pointer items-center justify-center px-2 text-slate-800 transition hover:bg-amber-50 disabled:cursor-not-allowed"
        aria-label={`Increase quantity for ${ariaLabel}`}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

export function CartLineActionLinks({ onDelete, onSaveForLater, busy }) {
  const linkClass =
    "cursor-pointer text-sm text-[#007185] hover:text-[#c7511f] hover:underline disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm">
      <button type="button" disabled={busy} onClick={onDelete} className={linkClass}>
        Delete
      </button>
      <span className="text-slate-300" aria-hidden>
        |
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={onSaveForLater}
        className={linkClass}
      >
        Save for later
      </button>
    </div>
  );
}

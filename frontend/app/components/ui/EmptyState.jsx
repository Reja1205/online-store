import Link from "next/link";
import Button from "./Button";

const linkPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-brand-hover)] hover:shadow-md active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  href,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center ${className}`}
      role="status"
    >
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}
      {actionLabel && href ? (
        <div className="mt-6">
          <Link href={href} className={linkPrimaryClass}>
            {actionLabel}
          </Link>
        </div>
      ) : null}
      {actionLabel && onAction && !href ? (
        <div className="mt-6">
          <Button type="button" variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

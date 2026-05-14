const styles = {
  danger: "border-red-200 bg-red-50 text-red-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-slate-200 bg-slate-50 text-slate-800",
};

export default function Callout({ variant = "info", title, children, className = "" }) {
  const role = variant === "danger" || variant === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${styles[variant] || styles.info} ${className}`}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

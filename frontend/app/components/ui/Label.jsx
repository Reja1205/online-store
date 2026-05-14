export default function Label({ children, htmlFor, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-semibold uppercase tracking-wide text-slate-600 ${className}`}
    >
      {children}
    </label>
  );
}

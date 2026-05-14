const tones = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
  warning: "bg-amber-50 text-amber-900 ring-amber-600/15",
  danger: "bg-red-50 text-red-800 ring-red-600/15",
  neutral: "bg-slate-100 text-slate-700 ring-slate-600/10",
  info: "bg-indigo-50 text-indigo-800 ring-indigo-600/15",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

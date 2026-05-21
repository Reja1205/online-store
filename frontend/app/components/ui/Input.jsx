export default function Input({ className = "", id, ...props }) {
  return (
    <input
      id={id}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-sm:text-[16px] ${className}`}
      {...props}
    />
  );
}

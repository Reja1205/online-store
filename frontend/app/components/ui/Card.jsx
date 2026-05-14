export default function Card({ children, className = "", padding = "p-5" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

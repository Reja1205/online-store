const variants = {
  primary:
    "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  outlineDark:
    "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg min-h-[2.25rem]",
  md: "px-4 py-2.5 text-sm font-medium rounded-xl min-h-[2.75rem]",
  lg: "px-5 py-3 text-sm font-semibold rounded-xl min-h-[3rem]",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}) {
  const base =
    "inline-flex touch-manipulation items-center justify-center gap-2 font-medium transition-colors duration-200 max-sm:active:scale-100 sm:active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]";

  return (
    <Component
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}

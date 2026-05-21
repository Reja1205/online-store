export default function Container({ children, className = "" }) {
  return (
    <div
      className={`mx-auto box-border w-full min-w-0 max-w-[1500px] px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

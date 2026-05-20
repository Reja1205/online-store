export function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/90 ${className}`} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-row overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm md:flex-col">
      <SkeletonLine className="h-[7.25rem] w-[7.25rem] shrink-0 sm:h-32 sm:w-32 md:h-44 md:w-full md:min-h-[12rem]" />
      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3 md:space-y-3 md:p-4">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/4" />
        <SkeletonLine className="h-3 w-full" />
        <div className="mt-auto flex gap-2 pt-1">
          <SkeletonLine className="h-9 flex-1 md:h-10" />
          <SkeletonLine className="h-9 flex-1 md:h-10" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/90 ${className}`} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <SkeletonLine className="h-44 w-full sm:aspect-[4/3] sm:h-auto sm:min-h-[12rem]" />
      <div className="space-y-3 p-4">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/4" />
        <SkeletonLine className="h-3 w-full" />
        <div className="flex gap-2 pt-2">
          <SkeletonLine className="h-10 flex-1" />
          <SkeletonLine className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

"use client";

import Button from "./ui/Button";

export default function ViewMoreButton({ hasMore, remaining, onLoadMore, className = "" }) {
  if (!hasMore) return null;

  return (
    <div className={`flex flex-col items-center gap-2 pt-2 ${className}`}>
      <Button type="button" variant="secondary" size="md" onClick={onLoadMore}>
        View more products
        {remaining > 0 ? ` (${remaining} left)` : ""}
      </Button>
    </div>
  );
}

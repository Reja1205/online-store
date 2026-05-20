"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const CATALOG_BATCH_SIZE = 10;

/**
 * Incremental "view more" list — shows `batchSize` items, then loads more on demand.
 * Resets when `items` identity/length changes (e.g. filter/search).
 */
export function useViewMore(items, batchSize = CATALOG_BATCH_SIZE, resetDeps = []) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const total = items.length;

  const resetKey = useMemo(
    () => items.map((it) => it?._id ?? it?.id).join("|"),
    [items]
  );

  useEffect(() => {
    setVisibleCount(batchSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetDeps are intentional extra triggers
  }, [resetKey, batchSize, ...resetDeps]);

  const visible = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const hasMore = visibleCount < total;
  const remaining = Math.max(0, total - visibleCount);

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(total, n + batchSize));
  }, [total, batchSize]);

  return {
    visible,
    loadMore,
    hasMore,
    remaining,
    total,
    shownCount: visible.length,
  };
}

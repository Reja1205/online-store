"use client";

import { useCallback, useRef } from "react";

const SWIPE_THRESHOLD_PX = 48;

/**
 * Lightweight touch swipe for custom carousels (no Swiper dependency).
 * Ignores mostly-vertical gestures so page scroll still works.
 */
export function useCarouselSwipe({ onNext, onPrev, enabled = true }) {
  const start = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback(
    (e) => {
      if (!enabled) return;
      const t = e.changedTouches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    [enabled]
  );

  const onTouchEnd = useCallback(
    (e) => {
      if (!enabled) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) onNext();
      else onPrev();
    },
    [enabled, onNext, onPrev]
  );

  return { onTouchStart, onTouchEnd };
}

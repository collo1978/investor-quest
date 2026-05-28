"use client";

import { useEffect, useRef } from "react";

const DEFAULT_INTRO_MS = 600;

/**
 * Fires `onComplete` once after a fixed wall-clock duration.
 * Does not depend on persistence, images, or animation libraries.
 */
export function useDeterministicIntro(
  onComplete: () => void,
  durationMs = DEFAULT_INTRO_MS
): void {
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    doneRef.current = false;
    const startedAt = performance.now();
    let raf = 0;

    const tick = () => {
      if (doneRef.current) return;
      if (performance.now() - startedAt >= durationMs) {
        doneRef.current = true;
        onCompleteRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      doneRef.current = true;
      cancelAnimationFrame(raf);
    };
  }, [durationMs]);
}

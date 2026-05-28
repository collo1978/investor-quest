"use client";

import { useEffect, useRef } from "react";

/** Run `fn` exactly once on mount — avoids Next `router` identity churn re-firing effects. */
export function useRunOnceOnMount(fn: () => void): void {
  const ran = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    fnRef.current();
  }, []);
}

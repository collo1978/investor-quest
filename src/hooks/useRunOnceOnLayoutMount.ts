"use client";

import { useLayoutEffect, useRef } from "react";

/** Run `fn` exactly once before child effects — stable for route bootstraps. */
export function useRunOnceOnLayoutMount(fn: () => void): void {
  const ran = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useLayoutEffect(() => {
    if (ran.current) return;
    ran.current = true;
    fnRef.current();
  }, []);
}

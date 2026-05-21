"use client";

import { useEffect, useState } from "react";

/** True after the client has mounted — use to avoid SSR/client markup drift. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

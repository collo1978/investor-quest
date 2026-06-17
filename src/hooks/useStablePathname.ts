"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Pathname for shell / layout branching — keeps SSR and the first client paint aligned.
 * `usePathname()` can lag one frame on hydration for nested `/schools/demo/*` routes.
 */
export function useStablePathname(initialPathname = ""): string {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return initialPathname || pathname;
  }

  return pathname || initialPathname;
}

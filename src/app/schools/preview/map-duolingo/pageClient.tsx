"use client";

import { useEffect, useState } from "react";

import { SchoolsDuolingoMapScreen } from "@/components/schools/SchoolsDuolingoMapScreen";

/**
 * Fullscreen Schools preview — Duolingo-style educational progression map.
 * App chrome removal is handled in `AppShell` for `/schools/preview/*`.
 */
export default function SchoolsDuolingoMapPageClient() {
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
  }, []);

  return (
    <div
      className={[
        "pointer-events-auto h-[100vh] w-[100vw] overflow-hidden",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <SchoolsDuolingoMapScreen />
    </div>
  );
}

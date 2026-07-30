"use client";

import { useEffect, useState } from "react";

import { SchoolsCartoonMapScreen } from "@/components/schools/SchoolsCartoonMapScreen";

/** Fullscreen Schools preview — Mario-style cartoon world map. */
export default function SchoolsCartoonMapPageClient() {
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
  }, []);

  return (
    <div
      className={[
        "pointer-events-auto h-[100dvh] w-full overflow-hidden",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <SchoolsCartoonMapScreen />
    </div>
  );
}

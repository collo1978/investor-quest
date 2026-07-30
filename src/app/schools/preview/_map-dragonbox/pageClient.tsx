"use client";

import { useEffect, useState } from "react";

import { SchoolsDragonBoxMapScreen } from "@/components/schools/SchoolsDragonBoxMapScreen";

/** Fullscreen Schools preview — DragonBox-style minimalist learning map. */
export default function SchoolsDragonBoxMapPageClient() {
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
      <SchoolsDragonBoxMapScreen />
    </div>
  );
}

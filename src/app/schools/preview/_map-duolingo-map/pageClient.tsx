"use client";

import { useEffect, useState } from "react";

import { SchoolsDuolingoBoardMapScreen } from "@/components/schools/SchoolsDuolingoBoardMapScreen";

/** Fullscreen Schools preview — flat cartoon 2D quest board map. */
export default function SchoolsDuolingoBoardMapPageClient() {
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
      <SchoolsDuolingoBoardMapScreen />
    </div>
  );
}

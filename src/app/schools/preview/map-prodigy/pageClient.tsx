"use client";

import { useEffect, useState } from "react";

import { SchoolsProdigyMapScreen } from "@/components/schools/SchoolsProdigyMapScreen";

/** Fullscreen Schools preview — Prodigy-style fantasy adventure world map. */
export default function SchoolsProdigyMapPageClient() {
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
  }, []);

  return (
    <div
      className={[
        "pointer-events-auto h-[100dvh] w-[100vw] overflow-hidden",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <SchoolsProdigyMapScreen />
    </div>
  );
}

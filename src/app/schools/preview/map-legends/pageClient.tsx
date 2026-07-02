"use client";

import { useEffect, useState } from "react";

import { SchoolsLegendsMapScreen } from "@/components/schools/SchoolsLegendsMapScreen";

/** Fullscreen Schools preview — Legends of Learning-style adventure world. */
export default function SchoolsLegendsMapPageClient() {
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
      <SchoolsLegendsMapScreen />
    </div>
  );
}

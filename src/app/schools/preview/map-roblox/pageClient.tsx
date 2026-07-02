"use client";

import { useEffect, useState } from "react";

import { SchoolsRobloxMapScreen } from "@/components/schools/SchoolsRobloxMapScreen";

/** Fullscreen Schools preview — Roblox-style adventure world map. */
export default function SchoolsRobloxMapPageClient() {
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
      <SchoolsRobloxMapScreen />
    </div>
  );
}

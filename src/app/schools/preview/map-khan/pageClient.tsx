"use client";

import { useEffect, useState } from "react";

import { SchoolsKhanMapScreen } from "@/components/schools/SchoolsKhanMapScreen";

/** Fullscreen Schools preview — Khan Academy-style learning journey. */
export default function SchoolsKhanMapPageClient() {
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
      <SchoolsKhanMapScreen />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { QuestMapScene } from "@/components/map/QuestMapScene";
import { DESKTOP_MAP_PATH } from "@/lib/screenAssetUrls";

/**
 * Fullscreen Schools production preview of the quest map.
 * - No AppShell chrome (handled in `AppShell` for `/schools/preview/*`)
 * - 100vw × 100vh viewport
 * - Background uses `cover` so editors/sidebars don't skew judgement
 * - Interactive scene remains centered and letterbox-aligned to protect hotspots
 */
export default function SchoolsPreviewMapPageClient() {
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
  }, []);

  return (
    <main
      className={[
        "pointer-events-auto relative h-[100vh] w-[100vw] overflow-hidden",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
      style={{
        backgroundImage: `url(${DESKTOP_MAP_PATH})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Darken edges so cover-crop remains premium and legible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 42%, rgba(5,5,16,0.2) 0%, rgba(5,5,16,0.65) 72%, rgba(5,5,16,0.82) 100%)"
        }}
      />

      {/* Interactive scene: centered, letterbox-safe. */}
      <div className="absolute inset-0">
        <QuestMapScene />
      </div>
    </main>
  );
}


"use client";

/**
 * MapPageClient — page-level container for the Quest Map.
 *
 * The Quest Map is intentionally a "cinematic image first, interactive
 * hotspots second" surface: the original `quest-map.png` artwork is the
 * visual, and `QuestMapScene` overlays invisible clickable hotspots over
 * each island. This file owns the page chrome (stage sizing, error
 * boundary) and delegates the actual scene to `QuestMapScene`.
 */

import { Component, type ReactNode, useEffect, useState } from "react";
import { QuestMapScene } from "@/components/map/QuestMapScene";
import { QUEST_MAP_PATH } from "@/lib/screenAssetUrls";

export default function MapPageClient() {
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
  }, []);

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full overflow-hidden bg-bg-0",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      {/* The map stage owns *its own* explicit height so its `absolute
          inset-0` child (the scene) always has a real rectangle to fill.
          - Mobile:  100dvh − header (72px) − bottom nav (~128px)
          - Desktop: 100dvh − 2rem
          Defined in globals.css under `.quest-map-stage-height` because
          Tailwind v4 can't compile arbitrary calcs that contain
          `var(--name, fallback)` — the comma breaks its parser. */}
      <div
        className={[
          "pointer-events-auto relative z-[1] mx-auto w-full overflow-hidden",
          "quest-map-stage-height",
          "px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-2.5 md:py-2"
        ].join(" ")}
        data-map-stage
      >
        <MapSceneOrFallback />
      </div>
    </main>
  );
}

/**
 * MapSceneOrFallback — last-line safety net. If `QuestMapScene` ever
 * throws on the client we degrade to a plain image render so /map is
 * never blank for the user. The fallback image is the *same* artwork the
 * scene renders, just without hotspots — links are surfaced as a small
 * caption underneath so the user can still reach each pillar.
 */
class MapSceneOrFallback extends Component<unknown, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== "undefined") {
      console.error(
        "[QuestMapScene] failed to render — falling back to static image",
        error
      );
    }
  }

  render(): ReactNode {
    if (this.state.failed) {
      return <QuestMapStaticFallback />;
    }
    return <QuestMapScene />;
  }
}

function QuestMapStaticFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-3xl bg-[#05050F]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={QUEST_MAP_PATH}
        alt="Quest Map"
        className="pointer-events-none max-h-full max-w-full select-none object-contain"
      />
    </div>
  );
}

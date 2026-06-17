"use client";

import type { CSSProperties } from "react";

import {
  SCHOOLS_BRIDGE_FLOW_DURATION_S,
  SCHOOLS_MAP_BUSINESS_BUILDING
} from "@/lib/schools/schoolsMapUnlockAnimation";

export type SchoolsBusinessBuildingGlowPhase = "impact" | "lit";

type Props = {
  phase: SchoolsBusinessBuildingGlowPhase;
  /** Flash the tower on each continuous pulse arrival. */
  pulseReactive?: boolean;
};

/**
 * Warm tower glow when bridge energy strikes the Business Kingdom skyscraper.
 */
export function SchoolsMapBusinessBuildingGlow({
  phase,
  pulseReactive = false
}: Props) {
  const { x, y } = SCHOOLS_MAP_BUSINESS_BUILDING;

  return (
    <div
      aria-hidden
      className={[
        "iq-schools-map-business-building-glow pointer-events-none absolute z-[13]",
        phase === "impact"
          ? "iq-schools-map-business-building-glow--impact"
          : pulseReactive
            ? "iq-schools-map-business-building-glow--lit-reactive"
            : "iq-schools-map-business-building-glow--lit"
      ].join(" ")}
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          "--schools-bridge-flow-s": SCHOOLS_BRIDGE_FLOW_DURATION_S
        } as CSSProperties
      }
    />
  );
}

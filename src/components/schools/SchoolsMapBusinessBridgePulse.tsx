"use client";

import { useId } from "react";

import {
  SCHOOLS_BRIDGE_ENERGY,
  SCHOOLS_BRIDGE_FLOW_DURATION_S,
  SCHOOLS_MAP_BUSINESS_UNLOCK_PATH
} from "@/lib/schools/schoolsMapUnlockAnimation";

type Props = {
  active: boolean;
};

/**
 * Continuous bridge energy — particles travel the straight portal → tower beam.
 */
export function SchoolsMapBusinessBridgePulse({ active }: Props) {
  const pathId = useId().replace(/:/g, "");
  const pathHref = `#${pathId}`;
  const flowS = SCHOOLS_BRIDGE_FLOW_DURATION_S;
  const shimmerS = flowS * 1.45;
  const { core, mid, edge } = SCHOOLS_BRIDGE_ENERGY;

  if (!active) return null;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-[14] h-full w-full"
      style={{ mixBlendMode: "screen", overflow: "visible" }}
    >
      <defs>
        <path
          id={pathId}
          d={SCHOOLS_MAP_BUSINESS_UNLOCK_PATH}
          fill="none"
          stroke="none"
        />
      </defs>

      <g opacity={0.9}>
        <path
          d={SCHOOLS_MAP_BUSINESS_UNLOCK_PATH}
          fill="none"
          stroke={edge}
          strokeWidth={0.42}
          strokeLinecap="round"
          opacity={0.38}
        />

        {[
          { phase: 0, r: 0.3, fill: mid, opacity: 0.92 },
          { phase: 0.33, r: 0.26, fill: core, opacity: 1 },
          { phase: 0.66, r: 0.28, fill: mid, opacity: 0.88 }
        ].map((tick) => (
          <circle
            key={`tick-${tick.phase}`}
            r={tick.r}
            fill={tick.fill}
            opacity={tick.opacity}
          >
            <animateMotion
              dur={`${flowS}s`}
              repeatCount="indefinite"
              begin={`-${(tick.phase * flowS).toFixed(2)}s`}
              calcMode="linear"
            >
              <mpath href={pathHref} />
            </animateMotion>
          </circle>
        ))}

        <circle r={0.38} fill={core} opacity={0}>
          <animateMotion
            dur={`${shimmerS}s`}
            repeatCount="indefinite"
            begin="0s"
            calcMode="linear"
          >
            <mpath href={pathHref} />
          </animateMotion>
          <animate
            attributeName="opacity"
            dur={`${shimmerS}s`}
            repeatCount="indefinite"
            values="0; 0; 0.65; 0.65; 0"
            keyTimes="0; 0.2; 0.48; 0.74; 1"
          />
        </circle>
      </g>
    </svg>
  );
}

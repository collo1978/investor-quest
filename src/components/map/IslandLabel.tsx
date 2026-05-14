"use client";

/**
 * IslandLabel — lightweight holographic HUD chip that floats diagonally
 * outward from an island, instead of a heavy card beneath it.
 *
 * Design intent (vs. the previous card):
 *   • ~33% smaller (124px wide, was 180px).
 *   • Translucent glassy holo look — gradient background, thin glowing
 *     border, soft outer shadow, NO heavy backdrop blur or solid fill.
 *   • Anchored diagonally outward (`anchor` prop) so it never covers the
 *     centre of the island artwork.
 *   • Decorative-only (`pointer-events: none`) — the parent island Link
 *     still owns the click target on the structure itself.
 */

import type { IslandVisualState } from "@/components/map/islandTokens";

export type LabelAnchor =
  | "above-left"
  | "above-right"
  | "below-left"
  | "below-right";

export type IslandLabelProps = {
  title: string;
  state: IslandVisualState;
  /** e.g. "3/5". */
  readLabel: string;
  /** 0..100 — progressbar fill inside the chip. */
  progressPct: number;
  /** Which corner of the island stage to dock the chip into. */
  anchor: LabelAnchor;
};

export function IslandLabel({
  title,
  state,
  readLabel,
  progressPct,
  anchor
}: IslandLabelProps) {
  const tone = TONE_BY_STATE[state];
  const stateLabel = LABEL_BY_STATE[state];
  const pos = ANCHOR_STYLES[anchor];

  return (
    <div
      className="pointer-events-none absolute z-[5] w-[124px]"
      style={pos}
    >
      <div
        className="relative overflow-hidden rounded-xl border px-2 py-1.5"
        style={{
          borderColor: tone.border,
          background:
            "linear-gradient(140deg, rgba(7,7,18,0.55) 0%, rgba(7,7,18,0.30) 100%)",
          boxShadow: `0 8px 22px -14px ${tone.glow}, inset 0 0 0 1px rgba(255,255,255,0.05)`,
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)"
        }}
      >
        {/* Holographic scan-line — adds the "hud display" feel. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)"
          }}
        />

        {/* Top row: title + tiny state pip. */}
        <div className="relative flex items-center justify-between gap-1">
          <span
            className="truncate text-[10px] font-semibold uppercase tracking-[0.10em]"
            style={{
              color: tone.title,
              textShadow: `0 0 8px ${tone.glow}`
            }}
          >
            {title}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <span
              className="inline-block h-[5px] w-[5px] rounded-full"
              style={{
                background: tone.pillFg,
                boxShadow: `0 0 6px ${tone.pillFg}`
              }}
            />
            <span
              className="text-[7.5px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: tone.pillFg }}
            >
              {stateLabel}
            </span>
          </span>
        </div>

        {/* Bottom row: thin progress bar + counter. */}
        <div className="relative mt-1 flex items-center gap-1.5">
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div
              className="h-full"
              style={{
                width: `${Math.max(0, Math.min(100, progressPct))}%`,
                background: tone.barFill,
                boxShadow: `0 0 8px ${tone.glow}`
              }}
            />
          </div>
          <span
            className="text-[8px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "rgba(220,220,232,0.72)" }}
          >
            {readLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Positioning per anchor — chip docks BELOW the island and is pushed
 * sharply outward (well past the stage edge) so it can never overlap the
 * central 10K hub even for top-row islands whose stage bottom sits near
 * the hub band.
 *
 * Horizontal: left = -8% / 108% → label centre is OUTSIDE the stage on
 * the outward side, so the 124px chip sits clearly past the island
 * silhouette toward the map edge.
 * Vertical: +18px below the stage bottom for extra breathing room.
 *
 * NOTE: the "above-*" anchors are retained for type compatibility but no
 * longer used — every island now uses "below-*" so nothing palette-tinted
 * floats above a structure.
 */
const ANCHOR_STYLES: Record<LabelAnchor, React.CSSProperties> = {
  "above-left": {
    bottom: "100%",
    left: "-8%",
    transform: "translate(-50%, -18px)"
  },
  "above-right": {
    bottom: "100%",
    left: "108%",
    transform: "translate(-50%, -18px)"
  },
  "below-left": {
    top: "100%",
    left: "-8%",
    transform: "translate(-50%, 18px)"
  },
  "below-right": {
    top: "100%",
    left: "108%",
    transform: "translate(-50%, 18px)"
  }
};

const TONE_BY_STATE: Record<
  IslandVisualState,
  {
    title: string;
    border: string;
    glow: string;
    barFill: string;
    pillFg: string;
  }
> = {
  locked: {
    title: "rgba(220,220,232,0.70)",
    border: "rgba(255,255,255,0.10)",
    glow: "rgba(139,92,246,0.22)",
    barFill: "rgba(216,180,254,0.30)",
    pillFg: "rgba(220,220,232,0.70)"
  },
  unlocked: {
    title: "rgba(216,180,254,0.98)",
    border: "rgba(139,92,246,0.45)",
    glow: "rgba(139,92,246,0.48)",
    barFill: "rgba(168,85,247,0.85)",
    pillFg: "rgba(216,180,254,0.95)"
  },
  inProgress: {
    title: "rgba(192,232,180,0.98)",
    border: "rgba(110,231,183,0.48)",
    glow: "rgba(34,197,139,0.55)",
    barFill:
      "linear-gradient(90deg, rgba(168,85,247,0.85) 0%, rgba(110,231,183,0.95) 100%)",
    pillFg: "rgba(192,232,180,0.95)"
  },
  active: {
    title: "rgba(216,180,254,1)",
    border: "rgba(168,85,247,0.70)",
    glow: "rgba(168,85,247,0.65)",
    barFill: "rgba(216,180,254,0.95)",
    pillFg: "rgba(216,180,254,1)"
  },
  completed: {
    title: "rgba(255,229,141,1)",
    border: "rgba(245,197,71,0.70)",
    glow: "rgba(245,197,71,0.60)",
    barFill:
      "linear-gradient(90deg, rgba(245,197,71,0.95) 0%, rgba(255,229,141,1) 100%)",
    pillFg: "rgba(255,229,141,1)"
  }
};

const LABEL_BY_STATE: Record<IslandVisualState, string> = {
  locked: "Locked",
  unlocked: "Ready",
  inProgress: "Active",
  active: "Now",
  completed: "Done"
};

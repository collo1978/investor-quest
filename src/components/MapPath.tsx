"use client";

import { motion } from "framer-motion";

export function MapPath({
  steps,
  unlockedSteps
}: {
  steps: number;
  unlockedSteps: number;
}) {
  // Draw progress along connectors between nodes:
  // 1 unlocked pillar => no connector drawn yet (0)
  // N unlocked pillars => draw (N-1) / (steps-1)
  const progress =
    steps <= 1
      ? 1
      : Math.max(
          0,
          Math.min(1, (Math.max(1, unlockedSteps) - 1) / Math.max(1, steps - 1))
        );
  const height = steps * 220;
  const width = 220;

  // A simple “spine + gentle S-curves” path, scaled to height.
  // viewBox coordinates are stable; we scale via height style.
  const vbH = steps * 220;
  const x = 110;
  const y0 = 30;

  const d = [
    `M ${x} ${y0}`,
    // gentle curve segments
    ...Array.from({ length: steps - 1 }).map((_, i) => {
      const yA = y0 + i * 220;
      const yB = y0 + (i + 1) * 220;
      const dir = i % 2 === 0 ? 1 : -1;
      const cx1 = x + dir * 26;
      const cx2 = x - dir * 26;
      const mid = (yA + yB) / 2;
      return `C ${cx1} ${mid - 40}, ${cx2} ${mid + 40}, ${x} ${yB}`;
    })
  ].join(" ");

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 w-full"
      style={{ height }}
    >
      <svg
        className="absolute left-1/2 top-0 -translate-x-1/2 opacity-80"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${vbH}`}
        fill="none"
      >
        <path
          d={d}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <motion.path
          d={d}
          stroke="rgba(139,92,246,0.85)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 0 18px rgba(139,92,246,0.55))"
          }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />

        {Array.from({ length: steps }).map((_, i) => {
          const y = y0 + i * 220;
          const unlocked = i < unlockedSteps;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="7"
                fill={unlocked ? "rgba(139,92,246,0.85)" : "rgba(255,255,255,0.06)"}
                stroke={unlocked ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.12)"}
                strokeWidth="2"
              />
              {unlocked ? (
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill="transparent"
                  stroke="rgba(139,92,246,0.18)"
                  strokeWidth="2"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}


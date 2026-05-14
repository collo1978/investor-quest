"use client";

import { motion } from "framer-motion";

export type ProgressBarProps = {
  /** 0..100 */
  value: number;
  size?: "sm" | "md" | "lg";
  /** Show a numeric overlay (e.g. "12/30 · 40%"). */
  label?: string;
  locked?: boolean;
  /** Slot to render on the right (e.g. a chip). */
  rightSlot?: React.ReactNode;
  className?: string;
};

const SIZE_HEIGHT: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3"
};

/**
 * Generic, reusable progress bar.
 * Used by: HUD, pillar cards, quest cards, level-up summary.
 */
export function ProgressBar({
  value,
  size = "md",
  label,
  locked,
  rightSlot,
  className
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={["flex w-full items-center gap-3", className ?? ""].join(" ")}>
      <div
        className={[
          "relative w-full overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]",
          SIZE_HEIGHT[size]
        ].join(" ")}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={false}
          animate={{ width: `${locked ? 0 : pct}%` }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background:
              "linear-gradient(90deg, rgba(59,130,246,0.18), rgba(139,92,246,0.72), rgba(168,85,247,0.65))",
            boxShadow: locked ? "none" : "0 0 22px rgba(139,92,246,0.25)"
          }}
        />
      </div>
      {(label || rightSlot) && (
        <div className="flex shrink-0 items-center gap-2 text-[11px] text-ink-2">
          {label}
          {rightSlot}
        </div>
      )}
    </div>
  );
}

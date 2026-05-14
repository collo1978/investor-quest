"use client";

import { motion } from "framer-motion";

export function LevelBar({
  level,
  pct,
  label
}: {
  level: number;
  pct: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-xs text-ink-2 md:block">
        Lv <span className="text-ink-0">{level}</span>
      </div>
      <div className="relative h-2 w-[140px] overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[rgba(139,92,246,0.20)] via-[rgba(139,92,246,0.60)] to-[rgba(168,85,247,0.60)] shadow-[0_0_22px_rgba(139,92,246,0.35)]"
          initial={false}
          animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="hidden text-xs text-ink-2 md:block">{label}</div>
    </div>
  );
}


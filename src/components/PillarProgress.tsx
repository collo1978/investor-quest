"use client";

export function PillarProgress({
  completed,
  total,
  compact
}: {
  completed: number;
  total: number;
  compact?: boolean;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "relative h-2 w-full overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]",
          compact ? "max-w-[240px]" : ""
        ].join(" ")}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[rgba(139,92,246,0.20)] via-[rgba(139,92,246,0.55)] to-[rgba(168,85,247,0.55)] shadow-[0_0_24px_rgba(139,92,246,0.35)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="shrink-0 text-xs text-ink-2">
        <span className="text-ink-0">{completed}</span>/{total} · {pct}%
      </div>
    </div>
  );
}


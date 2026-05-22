"use client";

import { useMemo, useState } from "react";

import type { GameHealthCheckRecord } from "@/lib/gameHealth/types";
import {
  checksToTrendPoints,
  formatRelativeCheckTime,
  summarizeHealthTrend,
  trendTooltipLine,
  type HealthTrendPoint
} from "@/lib/operations/healthTrend";
import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";

import { opsPanel } from "./opsTheme";

const MAX_BARS = 5;
const CHART_MIN_H = 100;
const CHART_MAX_H = 140;

function barHeightPct(score: number): number {
  return Math.max(14, Math.min(100, score));
}

function TrendLegend() {
  const items = [
    { color: "#22c58b", label: "Demo Ready (90%+)" },
    { color: "#f5c547", label: "Good" },
    { color: "#f97316", label: "Warning" },
    { color: "#ef4444", label: "Critical" }
  ] as const;

  return (
    <div
      className="mt-4 flex flex-wrap gap-x-4 gap-y-2"
      role="list"
      aria-label="Score color legend"
    >
      {items.map((item) => (
        <span
          key={item.label}
          role="listitem"
          className="inline-flex items-center gap-1.5 text-[11px] text-white/55"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: item.color }}
            aria-hidden
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function TrendBar({
  point,
  selected,
  onSelect
}: {
  point: HealthTrendPoint;
  selected: boolean;
  onSelect: () => void;
}) {
  const tier = tierFromScoreOrLabel(point.score, point.statusLabel);
  const h = barHeightPct(point.score);
  const timeLabel = formatRelativeCheckTime(point.createdAt);

  return (
    <div className="flex min-w-[52px] flex-1 flex-col items-center">
      <button
        type="button"
        className="group flex w-full flex-col items-center touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80 rounded-lg"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={trendTooltipLine(point)}
        title={trendTooltipLine(point)}
      >
        <span
          className="mb-1 text-[11px] font-bold tabular-nums sm:text-[12px]"
          style={{ color: tier.color }}
        >
          {point.score}%
        </span>
        <div
          className="relative flex w-full max-w-[56px] items-end justify-center"
          style={{ height: CHART_MAX_H }}
        >
          <div
            className="w-full max-w-[44px] rounded-t-md transition-all duration-200 sm:max-w-[48px]"
            style={{
              height: `${(h / 100) * CHART_MAX_H}px`,
              minHeight: CHART_MIN_H * 0.14,
              background: `linear-gradient(180deg, ${tier.color}ee 0%, ${tier.color}99 100%)`,
              boxShadow: selected
                ? `0 0 0 2px ${tier.color}, 0 0 20px -4px ${tier.color}88`
                : `0 0 12px -6px ${tier.color}55`
            }}
          />
        </div>
        <span className="mt-2 max-w-[4.5rem] text-center text-[10px] leading-tight text-white/45 sm:text-[11px]">
          {timeLabel}
        </span>
      </button>
    </div>
  );
}

export function OpsHealthTrendChart({
  history
}: {
  history: readonly GameHealthCheckRecord[];
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const points = useMemo(
    () => checksToTrendPoints(history).slice(-MAX_BARS),
    [history]
  );

  const summary = useMemo(() => summarizeHealthTrend(points), [points]);

  const directionIcon =
    summary.direction === "up"
      ? "↑"
      : summary.direction === "down"
        ? "↓"
        : summary.direction === "ready"
          ? "✓"
          : "→";

  const directionColor =
    summary.direction === "up" || summary.direction === "ready"
      ? "#22c58b"
      : summary.direction === "down"
        ? "#ef4444"
        : "#a78bfa";

  if (points.length < 2) {
    return (
      <section className={opsPanel}>
        <h2 className="text-sm font-semibold text-white/80">Health trend</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-white/55">
          Run at least two health checks to see whether the platform is improving
          or something broke.
        </p>
      </section>
    );
  }

  const activeIndex =
    selectedIndex != null && selectedIndex < points.length
      ? selectedIndex
      : points.length - 1;
  const activePoint = points[activeIndex];

  return (
    <section className={opsPanel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white/80">Health trend</h2>
          <p className="mt-1 text-[12px] text-white/45">
            Last {points.length} checks · oldest left, newest right
          </p>
        </div>
        <div
          className="rounded-xl border px-3 py-2 text-right"
          style={{
            borderColor: `${directionColor}44`,
            background: `${directionColor}12`
          }}
        >
          <p
            className="text-[13px] font-bold"
            style={{ color: directionColor }}
          >
            {summary.headline} {directionIcon}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-snug text-white/70">
        {summary.detail}
      </p>

      <div className="mt-5 -mx-1 overflow-x-auto pb-1 touch-pan-x">
        <div
          className="flex min-w-[min(100%,280px)] items-end justify-between gap-1 px-1 sm:min-w-0 sm:gap-2"
          role="img"
          aria-label={`Health scores over the last ${points.length} checks`}
        >
        {points.map((point, i) => (
          <TrendBar
            key={point.createdAt}
            point={point}
            selected={activeIndex === i}
            onSelect={() =>
              setSelectedIndex((prev) => (prev === i ? null : i))
            }
          />
        ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-xl border border-violet-500/25 bg-violet-500/10 px-3.5 py-3"
        role="status"
        aria-live="polite"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-200/80">
          {selectedIndex != null ? "Selected check" : "Latest check"}
        </p>
        <p className="mt-1 text-[15px] font-semibold text-white/95">
          {trendTooltipLine(activePoint)}
        </p>
        <p className="mt-1 text-[12px] text-white/50">
          {new Date(activePoint.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}
          {activePoint.warningCount > 0 || activePoint.failCount > 0 ? (
            <>
              {" "}
              · {activePoint.warningCount} warning
              {activePoint.warningCount === 1 ? "" : "s"}
              {activePoint.failCount > 0
                ? ` · ${activePoint.failCount} failed`
                : ""}
            </>
          ) : (
            " · all checks passed"
          )}
        </p>
        <p className="mt-2 text-[11px] text-white/40">
          Tap a bar for details · hover on desktop
        </p>
      </div>

      <TrendLegend />
    </section>
  );
}

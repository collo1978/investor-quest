"use client";

import { motion } from "framer-motion";
import { formatAnalyticsNumber } from "@/lib/analytics/formatDisplay";
import { useClientMounted } from "@/hooks/useClientMounted";

type Point = { x: number; y: number };

function scaleSeries(
  values: number[],
  width: number,
  height: number,
  padding: number
): Point[] {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  return values.map((v, i) => ({
    x: padding + (i / Math.max(1, values.length - 1)) * innerW,
    y: padding + innerH - ((v - min) / span) * innerH
  }));
}

function pathFromPoints(points: Point[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

function areaPath(points: Point[], height: number, padding: number): string {
  if (points.length === 0) return "";
  const base = height - padding;
  const line = pathFromPoints(points);
  const last = points[points.length - 1]!;
  const first = points[0]!;
  return `${line} L ${last.x.toFixed(1)} ${base} L ${first.x.toFixed(1)} ${base} Z`;
}

export function GrowthLineChart({
  labels,
  series,
  height = 160,
  width = 480
}: {
  labels: string[];
  series: { name: string; values: number[]; color: string }[];
  height?: number;
  width?: number;
}) {
  const mounted = useClientMounted();
  const padding = 24;
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[320px] w-full"
        role="img"
        aria-label="Line chart"
      >
        {series.map((s) => {
          const pts = scaleSeries(s.values, width, height, padding);
          return (
            <g key={s.name}>
              <motion.path
                d={pathFromPoints(pts)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                initial={mounted ? { pathLength: 0, opacity: 0 } : false}
                animate={mounted ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </g>
          );
        })}
        {labels.length > 0 ? (
          <>
            <text
              x={padding}
              y={height - 4}
              className="fill-white/35 text-[8px]"
            >
              {labels[0]}
            </text>
            <text
              x={width - padding - 32}
              y={height - 4}
              className="fill-white/35 text-[8px]"
            >
              {labels[labels.length - 1]}
            </text>
          </>
        ) : null}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3">
        {series.map((s) => (
          <span
            key={s.name}
            className="flex items-center gap-1.5 text-[10px] text-white/55"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function GrowthAreaChart({
  labels,
  values,
  color = "#a855f7",
  height = 140,
  width = 480
}: {
  labels: string[];
  values: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  const mounted = useClientMounted();
  const padding = 20;
  const pts = scaleSeries(values, width, height, padding);
  return (
    <motion.div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[320px] w-full"
        role="img"
        aria-label="Area chart"
      >
        <defs>
          <linearGradient id="growthAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath(pts, height, padding)}
          fill="url(#growthAreaFill)"
          initial={mounted ? { opacity: 0 } : false}
          animate={mounted ? { opacity: 1 } : undefined}
          transition={{ duration: 0.7 }}
        />
        <motion.path
          d={pathFromPoints(pts)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          initial={mounted ? { pathLength: 0 } : false}
          animate={mounted ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.9 }}
        />
        {labels.length > 0 ? (
          <>
            <text
              x={padding}
              y={height - 4}
              className="fill-white/35 text-[8px]"
            >
              {labels[0]}
            </text>
            <text
              x={width - padding - 32}
              y={height - 4}
              className="fill-white/35 text-[8px]"
            >
              {labels[labels.length - 1]}
            </text>
          </>
        ) : null}
      </svg>
    </motion.div>
  );
}

export function GrowthBarChart({
  rows,
  maxBars = 8
}: {
  rows: { label: string; value: number }[];
  maxBars?: number;
}) {
  const mounted = useClientMounted();
  const slice = rows.slice(0, maxBars);
  const max = Math.max(1, ...slice.map((r) => r.value));
  return (
    <div className="space-y-2">
      {slice.map((row, i) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_3fr] gap-3 items-center">
          <span className="truncate text-[11px] text-white/65">{row.label}</span>
          <div className="relative h-6 overflow-hidden rounded-lg border border-white/10 bg-black/30">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-violet-600/80 to-violet-400/60"
              initial={mounted ? { width: 0 } : false}
              animate={
                mounted ? { width: `${(row.value / max) * 100}%` } : undefined
              }
              transition={{ delay: i * 0.04, duration: 0.6, ease: "easeOut" }}
            />
            <span className="relative z-10 flex h-full items-center justify-end pr-2 text-[10px] font-semibold tabular-nums text-white/90">
              {formatAnalyticsNumber(row.value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

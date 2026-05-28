"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import {
  GEO_MAP_VIEWBOX,
  GEOGRAPHIC_REGION_MAP_LAYOUT,
  GLOBE_FRAME,
  WORLD_LAND_BASE_PATHS
} from "@/lib/geographicRevenue/geographicRevenueMapLayout";
import { formatRevenueUsd } from "@/lib/geographicRevenue/formatRevenueUsd";
import type {
  GeographicRevenueReport,
  GeographicRevenueSegment
} from "@/lib/geographicRevenue/types";
import type { GeographicRevenueRegionKey } from "@/lib/geographicRevenue/types";

type Props = {
  report: GeographicRevenueReport;
  theme: PillarQuestTheme;
};

const RENDER_ORDER: GeographicRevenueRegionKey[] = [
  "rest_of_asia_pacific",
  "americas",
  "europe",
  "greater_china",
  "japan"
];

function fillOpacityForPercent(percent: number, maxPercent: number): number {
  const t = maxPercent > 0 ? percent / maxPercent : 0;
  return 0.26 + t * 0.64;
}

export function GeographicRevenueMap({ report, theme }: Props) {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();

  const segments = useMemo(
    () => [...report.segments].sort((a, b) => b.percent - a.percent),
    [report.segments]
  );
  const maxPercent = useMemo(
    () => Math.max(...segments.map((s) => s.percent), 1),
    [segments]
  );
  const primaryKey = segments[0]?.regionKey;

  const { width, height } = GEO_MAP_VIEWBOX;
  const { cx, cy, rx, ry } = GLOBE_FRAME;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(4,6,14,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      role="img"
      aria-label="Globe map showing revenue by geographic region"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${theme.glowSoft}, transparent 75%)`
        }}
      />

      {report.headline ? (
        <p className="relative z-[1] px-4 pt-4 text-center text-[13px] font-medium leading-snug text-ink-0/92">
          {report.headline}
        </p>
      ) : null}

      <motion.div
        className="relative z-[1] w-full px-2 pt-3 pb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <radialGradient id={`${uid}-sphere`} cx="38%" cy="32%" r="72%">
              <stop offset="0%" stopColor="rgba(22,32,58,0.95)" />
              <stop offset="55%" stopColor="rgba(8,12,26,1)" />
              <stop offset="100%" stopColor="rgba(2,4,12,1)" />
            </radialGradient>
            <linearGradient id={`${uid}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
            <clipPath id={`${uid}-globe-clip`}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
            </clipPath>
          </defs>

          <rect width={width} height={height} rx={8} fill="rgba(2,4,12,1)" />

          {/* Globe sphere */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={`url(#${uid}-sphere)`}
            stroke={`url(#${uid}-rim)`}
            strokeWidth={1.25}
          />

          <g clipPath={`url(#${uid}-globe-clip)`}>
            {/* Graticule inside globe */}
            {[250, 500, 750].map((x) => (
              <line
                key={`lon-${x}`}
                x1={x}
                y1={cy - ry}
                x2={x}
                y2={cy + ry}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}
            {[cy - ry * 0.55, cy, cy + ry * 0.55].map((y, idx) => (
              <ellipse
                key={`lat-${idx}`}
                cx={cx}
                cy={y}
                rx={rx * 0.92}
                ry={ry * 0.22}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            {/* Full world landmass base */}
            <g
              fill="rgba(255,255,255,0.07)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.85"
              strokeLinejoin="round"
            >
              {WORLD_LAND_BASE_PATHS.map((d, i) => (
                <path key={`land-${i}`} d={d} />
              ))}
            </g>

            {/* Revenue regions */}
            {RENDER_ORDER.map((regionKey, i) => {
            const seg = segments.find((s) => s.regionKey === regionKey);
            const layout = GEOGRAPHIC_REGION_MAP_LAYOUT[regionKey];
            if (!seg || !layout) return null;

            const opacity = fillOpacityForPercent(seg.percent, maxPercent);
            const isPrimary = regionKey === primaryKey;
            const tooltip =
              seg.revenueUsd != null && seg.revenueUsd > 0
                ? `${seg.label}: ${Math.round(seg.percent)}% · ${formatRevenueUsd(seg.revenueUsd)}`
                : `${seg.label}: ${Math.round(seg.percent)}% of revenue`;

            return (
              <g key={regionKey}>
                <motion.path
                  d={layout.path}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  fill={theme.hi}
                  fillOpacity={opacity}
                  stroke={theme.hi}
                  strokeOpacity={isPrimary ? 0.75 : 0.45}
                  strokeWidth={isPrimary ? 1.5 : 1}
                  strokeLinejoin="round"
                  style={
                    isPrimary
                      ? {
                          filter: `drop-shadow(0 0 ${6 + opacity * 8}px ${theme.glow})`
                        }
                      : undefined
                  }
                >
                  <title>{tooltip}</title>
                </motion.path>

                {isPrimary && !reduceMotion ? (
                  <motion.path
                    d={layout.path}
                    fill="none"
                    stroke={theme.hi}
                    strokeWidth={2}
                    strokeOpacity={0.35}
                    animate={{ strokeOpacity: [0.2, 0.5, 0.2] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ) : null}

                <g pointerEvents="none">
                  <text
                    x={layout.labelX}
                    y={layout.labelY - 6}
                    textAnchor="middle"
                    className="fill-[rgba(255,248,230,0.95)] text-[13px] font-semibold"
                    style={{
                      fontFamily: "var(--font-grotesk), system-ui, sans-serif",
                      paintOrder: "stroke fill",
                      stroke: "rgba(4,6,14,0.85)",
                      strokeWidth: 3
                    }}
                  >
                    {seg.label}
                  </text>
                  <text
                    x={layout.labelX}
                    y={layout.labelY + 12}
                    textAnchor="middle"
                    className="fill-[rgba(255,236,160,1)] text-[15px] font-bold"
                    style={{
                      fontFamily: "var(--font-grotesk), system-ui, sans-serif",
                      paintOrder: "stroke fill",
                      stroke: "rgba(4,6,14,0.9)",
                      strokeWidth: 3
                    }}
                  >
                    {Math.round(seg.percent)}%
                  </text>
                </g>
              </g>
            );
          })}
          </g>

          {/* Specular highlight */}
          <ellipse
            cx={cx - rx * 0.28}
            cy={cy - ry * 0.32}
            rx={rx * 0.38}
            ry={ry * 0.28}
            fill="rgba(255,255,255,0.04)"
            pointerEvents="none"
          />
        </svg>
      </motion.div>

      <ul
        className="relative z-[1] grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/[0.06] px-3 py-3 sm:grid-cols-3 sm:px-4"
        aria-label="Revenue by region"
      >
        {segments.map((seg) => {
          const opacity = fillOpacityForPercent(seg.percent, maxPercent);
          const revenueLabel =
            seg.revenueUsd != null && seg.revenueUsd > 0
              ? formatRevenueUsd(seg.revenueUsd)
              : null;
          const isPrimary = seg.regionKey === primaryKey;
          return (
            <li
              key={seg.regionKey}
              className={[
                "flex min-w-0 flex-col gap-0.5 rounded-md px-1 py-0.5 text-[11px] leading-tight text-ink-0/88 sm:text-[11.5px]",
                isPrimary ? "bg-white/[0.04] ring-1 ring-amber-400/20" : ""
              ].join(" ")}
              title={`${seg.label}: ${Math.round(seg.percent)}%`}
            >
              <motion.div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{
                    background: theme.hi,
                    opacity,
                    boxShadow: `0 0 6px ${theme.glow}`
                  }}
                  aria-hidden
                />
                <span className="min-w-0 truncate font-medium">{seg.label}</span>
                <span
                  className="ml-auto shrink-0 font-bold tabular-nums"
                  style={{ color: theme.hi }}
                >
                  {Math.round(seg.percent)}%
                </span>
              </motion.div>
              {revenueLabel ? (
                <span className="pl-4 text-[10px] tabular-nums text-ink-2/80">
                  {revenueLabel}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

    </motion.div>
  );
}

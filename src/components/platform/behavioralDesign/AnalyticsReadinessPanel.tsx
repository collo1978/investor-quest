"use client";

import { useState } from "react";

import { BEHAVIORAL_METRIC_CATALOG, METRICS_BY_CATEGORY } from "@/platform/gamification/behavioralDesign/analytics/metricCatalog";
import { analyticsReadinessSummary } from "@/platform/gamification/behavioralDesign/analytics/buildFrameworkAnalyticsLayers";
import type { BehavioralIntelligenceReport } from "@/platform/gamification/behavioralDesign/analytics/types";
import { opsPanel } from "@/components/operations/opsTheme";

export function AnalyticsReadinessPanel({
  intelligence
}: {
  intelligence: BehavioralIntelligenceReport;
}) {
  const [open, setOpen] = useState(false);
  const summary = analyticsReadinessSummary(intelligence.analytics);

  return (
    <div className="rounded-xl border border-white/8 bg-black/20">
      <button
        type="button"
        className="flex w-full min-h-[44px] items-center justify-between gap-3 px-3 py-2.5 text-left touch-manipulation"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="text-[14px] font-semibold text-white/90">Analytics integration</p>
          <p className="mt-0.5 text-[11px] text-white/45">
            {summary.catalogSize} metrics · {summary.eventLinked} event-linked ·{" "}
            {summary.populatedInSnapshot} in snapshot
          </p>
        </div>
        <span className="text-white/35">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-white/8 px-3 py-3">
          <p className="text-[12px] leading-relaxed text-white/55">
            {intelligence.analytics.dataDisclaimer}
          </p>
          <p className="text-[11px] text-amber-200/80">
            Provider: {intelligence.analytics.source} · Window: last{" "}
            {intelligence.analytics.windowDays} days
          </p>

          {(Object.keys(METRICS_BY_CATEGORY) as Array<keyof typeof METRICS_BY_CATEGORY>).map(
            (category) => (
              <div key={category}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                  {category.replace(/_/g, " ")}
                </p>
                <ul className="mt-2 space-y-2">
                  {(METRICS_BY_CATEGORY[category] ?? []).map((def) => {
                    const mv = intelligence.analytics.metrics.find(
                      (m) => m.metricId === def.id
                    );
                    return (
                      <li
                        key={def.id}
                        className={`${opsPanel} !p-2.5 flex flex-wrap items-center justify-between gap-2 !shadow-none`}
                      >
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-white/80">{def.label}</p>
                          <p className="text-[10px] text-white/40">{def.id}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[12px] tabular-nums text-white/70">
                            {mv?.value != null ? formatVal(def.unit, mv.value) : "—"}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] uppercase ${
                              def.status === "live"
                                ? "bg-emerald-500/15 text-emerald-200"
                                : "bg-white/8 text-white/45"
                            }`}
                          >
                            {def.status}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          )}

          <p className="text-[11px] text-white/40">
            Catalog exports: {BEHAVIORAL_METRIC_CATALOG.length} definitions for warehouse mapping.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function formatVal(unit: string, value: number): string {
  if (unit === "percent" || unit === "ratio") {
    const pct = value <= 1 ? value * 100 : value;
    return `${Math.round(pct)}%`;
  }
  if (unit === "minutes") return `${value.toFixed(1)}m`;
  return String(Math.round(value));
}

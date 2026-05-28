"use client";

import { useState } from "react";

import { useBehavioralIntelligence } from "@/platform/gamification/behavioralDesign/useBehavioralIntelligence";
import type {
  FoggFactorId,
  HookStageId,
  OctalysisDriveId,
  SdtNeedId
} from "@/platform/gamification/behavioralDesign/types";

import {
  FoggFrameworkPanel,
  HookFrameworkPanel,
  OctalysisFrameworkPanel,
  SdtFrameworkPanel
} from "@/components/platform/behavioralDesign/BehavioralFrameworkPanels";
import { BehaviorStoryPanel } from "@/components/platform/behavioralDesign/BehaviorStoryPanel";
import { AnalyticsReadinessPanel } from "@/components/platform/behavioralDesign/AnalyticsReadinessPanel";
import { FrameworkAnalyticsPanel } from "@/components/platform/behavioralDesign/FrameworkAnalyticsPanel";
import { ClientReportingPanel } from "@/components/platform/behavioralDesign/ClientReportingPanel";
import {
  AuditStatusBadge,
  SourceTypeBadge
} from "@/components/platform/behavioralDesign/auditUi";
import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";
import { opsPanel } from "@/components/operations/opsTheme";

export function BehavioralDesignAuditsPanel() {
  const {
    scores,
    setScores,
    resetToDefaults,
    report,
    intelligence,
    hydrated,
    includeAnalytics,
    setIncludeAnalytics
  } = useBehavioralIntelligence();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"story" | "frameworks" | "reports">("story");

  if (!hydrated || !report || !intelligence) {
    return (
      <p className="py-4 text-center text-[13px] text-white/50">Loading behavioral intelligence…</p>
    );
  }

  const tier = tierFromScoreOrLabel(intelligence.intelligenceScore, null);

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06]">
      <button
        type="button"
        className="flex w-full min-h-[48px] flex-col gap-2 px-4 py-3 text-left touch-manipulation sm:flex-row sm:items-center sm:justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="text-[15px] font-bold text-white">Behavioral Design Audits</p>
          <p className="mt-1 text-[12px] text-white/50">
            Behavioral Intelligence System — frameworks, analytics-ready metrics, Behavior Story.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AuditStatusBadge status={intelligence.intelligenceStatus} />
            <SourceTypeBadge type={includeAnalytics ? "analytics_future" : "manual"} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="font-[var(--font-grotesk)] text-3xl font-bold tabular-nums"
            style={{ color: tier.color }}
          >
            {intelligence.intelligenceScore}%
          </span>
          <span className="text-white/40">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-violet-500/15 px-4 py-4">
          <div className={`${opsPanel} flex flex-wrap items-center justify-between gap-3 !p-3`}>
            <label className="flex items-center gap-2 text-[12px] text-white/65">
              <input
                type="checkbox"
                checked={includeAnalytics}
                onChange={(e) => setIncludeAnalytics(e.target.checked)}
                className="size-4 rounded border-white/20 accent-violet-500"
              />
              Blend placeholder cohort metrics (preview analytics pipeline)
            </label>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/80 hover:bg-white/10"
              onClick={resetToDefaults}
            >
              Reset to defaults
            </button>
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg bg-black/30 p-1 ring-1 ring-white/10">
            {(
              [
                ["story", "Behavior Story Summary"],
                ["frameworks", "Framework audits"],
                ["reports", "Client reports"]
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={[
                  "rounded-md px-3 py-1.5 text-[12px] font-semibold touch-manipulation",
                  tab === id
                    ? "bg-violet-500/25 text-violet-100"
                    : "text-white/50 hover:text-white/75"
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "story" ? (
            <>
              <BehaviorStoryPanel intelligence={intelligence} />
              <AnalyticsReadinessPanel intelligence={intelligence} />
              {intelligence.analyticsLayers.map((layer) => (
                <FrameworkAnalyticsPanel key={layer.frameworkId} layer={layer} />
              ))}
            </>
          ) : null}

          {tab === "frameworks" ? (
            <>
              <p className="text-[12px] text-white/55">
                Adjust manual scores (0–100). Saved in this browser until analytics API connects.
              </p>
              <OctalysisFrameworkPanel
                report={report.octalysis}
                scores={scores.octalysis}
                onScoreChange={(id: OctalysisDriveId, value) =>
                  setScores({
                    ...scores,
                    octalysis: { ...scores.octalysis, [id]: clamp(value) }
                  })
                }
              />
              <HookFrameworkPanel
                report={report.hook}
                scores={scores.hook}
                onScoreChange={(id: HookStageId, value) =>
                  setScores({
                    ...scores,
                    hook: { ...scores.hook, [id]: clamp(value) }
                  })
                }
              />
              <SdtFrameworkPanel
                report={report.sdt}
                scores={scores.sdt}
                onScoreChange={(id: SdtNeedId, value) =>
                  setScores({
                    ...scores,
                    sdt: { ...scores.sdt, [id]: clamp(value) }
                  })
                }
              />
              <FoggFrameworkPanel
                report={report.fogg}
                scores={scores.fogg}
                onScoreChange={(id: FoggFactorId, value) =>
                  setScores({
                    ...scores,
                    fogg: { ...scores.fogg, [id]: clamp(value) }
                  })
                }
              />
            </>
          ) : null}

          {tab === "reports" ? (
            <ClientReportingPanel reports={intelligence.clientReports} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

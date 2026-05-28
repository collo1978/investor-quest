"use client";

import { useMemo, useState } from "react";

import { RecoveryRepairWorkflow } from "@/components/platform/RecoveryRepairWorkflow";
import { opsPanel } from "@/components/operations/opsTheme";
import { hasActionableCommunicationIntelligence } from "@/lib/communicationQuality/actionableDisplay";
import { formatAnalyticsDateTime } from "@/lib/analytics/formatDisplay";
import {
  buildCommunicationRecovery,
  domainStubForRecovery
} from "@/lib/gameHealth/recoveryIntelligence";
import { opsTierPresentation } from "@/lib/operations/healthTier";
import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

type Props = {
  report: CommunicationQualityReport | null | undefined;
  openIssues?: GameHealthIssueRecord[];
  onRepairComplete?: (
    result: import("@/lib/gameHealth/missionControlRepairSync").RepairVerificationResult
  ) => void | Promise<void>;
};

function scoreTone(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 65) return "text-amber-400";
  return "text-rose-400";
}

export function CommunicationQualityPanel({
  report,
  openIssues,
  onRepairComplete
}: Props) {
  const [expanded, setExpanded] = useState(true);

  const recoveryIntelligence = useMemo(
    () =>
      report
        ? buildCommunicationRecovery(
            report,
            "communication_quality",
            "Communication Quality",
            report.overallHealthPercent
          )
        : null,
    [report]
  );

  if (!report || !recoveryIntelligence) return null;

  const tier = opsTierPresentation(report.overallHealthPercent);
  const actionable = hasActionableCommunicationIntelligence(report);

  return (
    <section className={`${opsPanel} border-sky-500/20 bg-sky-500/[0.04]`}>
      <button
        type="button"
        className="flex w-full min-h-[44px] items-start justify-between gap-3 text-left touch-manipulation"
        onClick={() => setExpanded((v) => !v)}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/80">
            Communication Quality Audit
          </p>
          <p className="mt-1 text-[14px] font-semibold leading-snug text-white/90">
            Smart-friend voice across cards, quizzes, and mastery screens
          </p>
          <p className="mt-1 text-[12px] text-white/50">
            {report.contentAudited} items audited · {report.placeholderCount} placeholders ·{" "}
            {report.cardsNeedingRegeneration.length} cards flagged for regen
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`text-2xl font-bold tabular-nums ${scoreTone(report.overallHealthPercent)}`}
          >
            {report.overallHealthPercent}%
          </p>
          <p className="text-[11px] font-medium text-white/60">{tier.shortLabel}</p>
          <span className="mt-1 block text-white/40">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded ? (
        <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
          {recoveryIntelligence.drivers.length > 0 ? (
            <RecoveryRepairWorkflow
              intelligence={recoveryIntelligence}
              domain={domainStubForRecovery(
                "communication_quality",
                report.overallHealthPercent
              )}
              domainId="communication_quality"
              domainLabel="Communication Quality"
              domainScore={report.overallHealthPercent}
              communicationQuality={report}
              openIssues={openIssues}
              compact
              onRepairComplete={onRepairComplete}
            />
          ) : actionable ? (
            <p className="text-[13px] text-white/55">
              Run a fresh health check to load flagged card copy for inline repair.
            </p>
          ) : (
            <p className="text-[13px] text-emerald-300/85">
              No cards need regeneration — communication audit looks clean for audited content.
            </p>
          )}

          <details className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <summary className="cursor-pointer text-[12px] font-semibold text-white/55 touch-manipulation">
              Category scores &amp; pillars
            </summary>
            <div className="mt-4 space-y-4 pb-2">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {report.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-lg bg-black/20 px-3 py-2.5 ring-1 ring-white/10"
                  >
                    <p className="text-[11px] font-medium text-white/55">{cat.label}</p>
                    <p
                      className={`mt-0.5 text-lg font-semibold tabular-nums ${scoreTone(cat.score)}`}
                    >
                      {cat.score}%
                    </p>
                    <p className="mt-1 text-[10px] text-white/40">
                      {cat.weak} weak / {cat.audited} scored
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  Per pillar
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {report.pillarScores.map((p) => (
                    <span
                      key={p.pillarId}
                      className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/75 ring-1 ring-white/10"
                    >
                      {p.label}{" "}
                      <span className={`font-semibold ${scoreTone(p.score)}`}>{p.score}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </details>

          <p className="text-[11px] leading-relaxed text-white/40">
            Audited at {formatAnalyticsDateTime(report.executedAt)} across{" "}
            {report.companiesAudited.join(", ")}. Includes quest cards, quiz explanations, and
            investor mastery copy — onboarding and future AI explanations use the same gates at
            generation time.
          </p>
        </div>
      ) : null}
    </section>
  );
}

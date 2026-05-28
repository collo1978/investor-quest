"use client";

import {
  CHECK_OUTCOME_LABELS,
  RESOLUTION_STATUS_LABELS,
  type ResolutionIntelligence
} from "@/lib/gameHealth/resolutionIntelligence/types";
import { formatVerificationDelta } from "@/lib/gameHealth/resolutionIntelligence/verifyIssueDisplay";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

import { OpsIssueActionableDetail } from "./OpsIssueActionableDetail";

const STATUS_TONE: Record<string, string> = {
  pending: "text-amber-200 bg-amber-500/15 border-amber-400/30",
  regenerated: "text-violet-200 bg-violet-500/15 border-violet-400/30",
  auto_fixed: "text-emerald-200 bg-emerald-500/15 border-emerald-400/30",
  manually_reviewed: "text-sky-200 bg-sky-500/15 border-sky-400/30",
  resolved: "text-emerald-200 bg-emerald-500/15 border-emerald-400/30",
  needs_human_review: "text-rose-200 bg-rose-500/15 border-rose-400/30"
};

/** Status-only strip for issue cards — operator copy lives in OpsOperatorRepairPanel / OpsIssueCard. */
export function OpsIssueIntelligencePanel({
  intelligence,
  issue,
  compact = false
}: {
  intelligence: ResolutionIntelligence | null;
  issue?: GameHealthIssueRecord | null;
  compact?: boolean;
}) {
  if (!intelligence) return issue ? <OpsIssueActionableDetail issue={issue} /> : null;

  const statusClass =
    STATUS_TONE[intelligence.resolutionStatus] ??
    "text-white/70 bg-white/5 border-white/10";

  const delta = intelligence.verification
    ? formatVerificationDelta(intelligence.verification)
    : null;

  if (compact) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClass}`}
        >
          {RESOLUTION_STATUS_LABELS[intelligence.resolutionStatus]}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200/90">
          {intelligence.auditCategoryLabel}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClass}`}
        >
          {RESOLUTION_STATUS_LABELS[intelligence.resolutionStatus]}
        </span>
      </div>

      <OpsIssueActionableDetail issue={issue} />

      {intelligence.verification ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/70">
            After your fix
          </p>
          <p className="mt-1 text-[13px] text-white/75">
            {intelligence.verification.summary}
          </p>
          {delta ? (
            <p className="mt-1 text-[12px] tabular-nums text-emerald-300/90">
              Score change: {delta}
              {intelligence.verification.beforeScore != null &&
              intelligence.verification.afterScore != null
                ? ` (${intelligence.verification.beforeScore}% → ${intelligence.verification.afterScore}%)`
                : null}
            </p>
          ) : null}
        </div>
      ) : null}

      {intelligence.checkOutcomeKind &&
      intelligence.checkOutcomeKind !== "actual_problem" ? (
        <p className="text-[12px] text-white/45">
          {CHECK_OUTCOME_LABELS[intelligence.checkOutcomeKind]} — does not lower content
          health score.
        </p>
      ) : null}
    </div>
  );
}

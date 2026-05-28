"use client";

import { RecoveryCardChangeSummary } from "@/components/platform/RecoveryCardChangeSummary";
import type { CardRepairChange } from "@/lib/gameHealth/missionControlRepairSync";

export type RepairLastOutcome = {
  problem: string;
  changeMade: string;
  status: "complete" | "partial" | "failed";
  domainLabel: string;
  scoreBefore: number;
  scoreAfter: number;
  cardChange?: CardRepairChange | null;
};

const STATUS_LABEL: Record<RepairLastOutcome["status"], string> = {
  complete: "Complete",
  partial: "Partial",
  failed: "Failed"
};

export function RepairLastOutcomePanel({ outcome }: { outcome: RepairLastOutcome }) {
  const statusTone =
    outcome.status === "complete"
      ? "border-emerald-500/30 text-emerald-200"
      : outcome.status === "partial"
        ? "border-amber-500/30 text-amber-200"
        : "border-red-500/30 text-red-200";

  return (
    <div className="space-y-4 rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
          Last repair result
        </p>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusTone}`}
        >
          {STATUS_LABEL[outcome.status]}
        </span>
      </div>

      <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Problem
          </dt>
          <dd className="mt-1 text-white/88">{outcome.problem}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Change made
          </dt>
          <dd className="mt-1 text-white/88">{outcome.changeMade}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Score before
          </dt>
          <dd className="mt-1 font-semibold tabular-nums text-white/90">
            {outcome.scoreBefore}%
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Score after
          </dt>
          <dd className="mt-1 font-semibold tabular-nums text-emerald-300">
            {outcome.scoreAfter}%
          </dd>
        </div>
      </dl>

      {outcome.cardChange ? (
        <RecoveryCardChangeSummary
          change={outcome.cardChange}
          domainLabel={outcome.domainLabel}
          domainScoreBefore={outcome.scoreBefore}
          domainScoreAfter={outcome.scoreAfter}
        />
      ) : (
        <p className="text-[12px] text-white/50">
          Sentence-level before/after appears here when a single card is verified or
          regenerated. Batch fixes update domain scores for all cards in scope.
        </p>
      )}
    </div>
  );
}

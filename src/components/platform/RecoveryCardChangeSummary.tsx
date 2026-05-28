"use client";

import { useState } from "react";

import { CopyChangeDiffView } from "@/components/platform/CopyChangeDiffView";
import { formatAnalyticsDateTime } from "@/lib/analytics/formatDisplay";
import type { CardRepairChange } from "@/lib/gameHealth/missionControlRepairSync";

const FIX_METHOD_LABEL: Record<CardRepairChange["fixMethod"], string> = {
  regenerated: "AI regenerated",
  manual_edit: "Manually edited",
  verify_only: "Verified after edit",
  auto_fixed: "Auto-fixed"
};

export function RecoveryCardChangeSummary({
  change,
  domainLabel,
  domainScoreBefore,
  domainScoreAfter
}: {
  change: CardRepairChange;
  domainLabel: string;
  domainScoreBefore: number;
  domainScoreAfter: number;
}) {
  const [showFullAfter, setShowFullAfter] = useState(false);

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] to-black/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/80">
            Copy transformation
          </p>
          <p className="mt-1 text-[13px] text-white/55">
            Review exactly what changed before trusting the score update.
          </p>
        </div>
        <span className="rounded-full border border-violet-400/35 bg-violet-500/15 px-3 py-1 text-[11px] font-bold uppercase text-violet-100">
          {FIX_METHOD_LABEL[change.fixMethod]}
        </span>
      </div>

      <CopyChangeDiffView
        before={change.beforeSentence}
        after={change.afterSentence}
        removedPhrases={change.removedPhrases}
      />

      {change.afterExcerpt && change.afterExcerpt.length > change.afterSentence.length + 20 ? (
        <div className="rounded-lg border border-white/10 bg-black/25 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left text-[12px] font-semibold text-white/60 touch-manipulation"
            onClick={() => setShowFullAfter((v) => !v)}
          >
            Full rewritten card excerpt
            <span>{showFullAfter ? "▲" : "▼"}</span>
          </button>
          {showFullAfter ? (
            <p className="mt-2 text-[13px] leading-relaxed text-white/80">{change.afterExcerpt}</p>
          ) : null}
        </div>
      ) : null}

      {change.improvementReasons.length > 0 ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            What improved
          </p>
          <ul className="mt-2 space-y-1.5">
            {change.improvementReasons.map((reason) => (
              <li
                key={reason}
                className="flex gap-2 text-[13px] leading-snug text-white/85 before:content-['✓'] before:font-bold before:text-emerald-400"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            What improved
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/85">{change.whatImproved}</p>
        </div>
      )}

      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
          Why it now passes
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-emerald-50/95">{change.whyPasses}</p>
      </div>

      <dl className="grid gap-2 border-t border-white/10 pt-3 text-[12px] sm:grid-cols-2">
        <div>
          <dt className="text-white/40">{domainLabel}</dt>
          <dd className="font-semibold tabular-nums text-emerald-300">
            {domainScoreBefore}% → {domainScoreAfter}%
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Card communication score</dt>
          <dd className="font-semibold tabular-nums text-emerald-300">
            {change.cardScoreBefore != null
              ? `${change.cardScoreBefore}% → ${change.cardScoreAfter}%`
              : `${change.cardScoreAfter}%`}
          </dd>
        </div>
        {change.contentSource ? (
          <div className="sm:col-span-2">
            <dt className="text-white/40">After copy source</dt>
            <dd className="text-white/75">{change.contentSource}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-white/40">Verified at</dt>
          <dd className="text-white/75">{formatAnalyticsDateTime(change.fixedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

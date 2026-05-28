"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { RecoveryCardChangeSummary } from "@/components/platform/RecoveryCardChangeSummary";
import type { CommunicationCategoryId } from "@/lib/communicationQuality/types";
import {
  actionableCardKey,
  formatQuestSectionLabel,
  questRegenerateAdminPath,
  type AuditActionableDetail
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import type {
  CardRepairChange,
  CardRepairFixMethod,
  RepairVerificationResult
} from "@/lib/gameHealth/missionControlRepairSync";
import type { HealthDomainId } from "@/lib/gameHealth/registry/types";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";

type CardPhase =
  | "ready"
  | "regenerating"
  | "verifying"
  | "resolved"
  | "needs_attention";

async function postVerifyDomain(input: {
  domainId: HealthDomainId;
  card?: {
    ticker: string;
    pillarId: string;
    questSlug: string;
    cardId: string;
    beforeFlaggedText: string;
    fixMethod: CardRepairFixMethod;
    beforeScore?: number | null;
    beforeWarnings?: Array<{
      code: string;
      categoryId?: string;
      message?: string;
      severity?: string;
    }>;
  };
}): Promise<RepairVerificationResult> {
  const res = await fetch("/api/admin/game-health/verify-domain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const json = (await res.json()) as {
    ok?: boolean;
    score?: number;
    error?: string;
    communicationQuality?: RepairVerificationResult["communicationQuality"];
    communicationOverall?: number;
    cardsStillFlagged?: number;
    cardChange?: CardRepairChange | null;
    domainId?: HealthDomainId;
  };

  if (!res.ok || !json.ok || json.score == null || !json.communicationQuality) {
    throw new Error(json.error ?? "Verification failed.");
  }

  return {
    domainId: json.domainId ?? input.domainId,
    domainScore: json.score,
    beforeScore: 0,
    communicationQuality: json.communicationQuality,
    communicationOverall: json.communicationOverall ?? json.communicationQuality.overallHealthPercent,
    cardsStillFlagged: json.cardsStillFlagged ?? 0,
    cardChange: json.cardChange ?? null
  };
}

export function RecoveryInlineCardRepair({
  detail,
  domainId,
  domainLabel,
  domainScoreBefore,
  defaultExpanded = true,
  onRepairComplete
}: {
  detail: AuditActionableDetail;
  domainId: HealthDomainId;
  domainLabel: string;
  domainScoreBefore: number;
  defaultExpanded?: boolean;
  onRepairComplete?: (result: RepairVerificationResult) => void | Promise<void>;
}) {
  const [expanded] = useState(defaultExpanded);
  const [phase, setPhase] = useState<CardPhase>("ready");
  const [message, setMessage] = useState<string | null>(null);
  const [domainScoreAfter, setDomainScoreAfter] = useState<number | null>(null);
  const [cardChange, setCardChange] = useState<CardRepairChange | null>(null);

  const loc = detail.location;
  const finding = detail.findings[0];
  const cardKey = actionableCardKey(detail);

  const warningsFromFindings = useCallback(() => {
    return detail.findings.map((f) => ({
      code: f.code,
      categoryId: f.categoryId as CommunicationCategoryId | undefined,
      message: f.reason,
      severity: f.severity ?? "warning"
    }));
  }, [detail.findings]);

  const loadRepairPreview = useCallback(
    async (fixMethod: CardRepairFixMethod) => {
      const ticker = loc.companyTicker;
      const pillarId = loc.pillarId;
      const questSlug = loc.questSlug;
      const cardId = loc.cardId;
      if (!ticker || !pillarId || !questSlug || !cardId || !finding) return null;

      const res = await fetch("/api/admin/game-health/card-repair-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          pillarId,
          questSlug,
          cardId,
          beforeFlaggedText: finding.flaggedText,
          fixMethod,
          beforeWarnings: warningsFromFindings()
        })
      });
      const json = (await res.json()) as {
        ok?: boolean;
        cardChange?: CardRepairChange;
      };
      if (!res.ok || !json.ok || !json.cardChange) return null;
      return json.cardChange;
    },
    [finding, loc, warningsFromFindings]
  );

  const runVerify = useCallback(
    async (fixMethod: CardRepairFixMethod) => {
      const ticker = loc.companyTicker;
      const pillarId = loc.pillarId;
      const questSlug = loc.questSlug;
      const cardId = loc.cardId;
      if (!ticker || !pillarId || !questSlug || !cardId || !finding) {
        throw new Error("Missing card location — cannot verify.");
      }

      const result = await postVerifyDomain({
        domainId,
        card: {
          ticker,
          pillarId,
          questSlug,
          cardId,
          beforeFlaggedText: finding.flaggedText,
          fixMethod,
          beforeScore: null,
          beforeWarnings: warningsFromFindings()
        }
      });

      result.beforeScore = domainScoreBefore;
      const newScore = result.domainScore;
      setDomainScoreAfter(newScore);
      let change = result.cardChange ?? null;
      if (!change) {
        change = await loadRepairPreview(fixMethod);
      }
      if (change) setCardChange(change);

      const improved = newScore > domainScoreBefore;
      setPhase(improved ? "resolved" : "needs_attention");
      setMessage(
        improved
          ? `${domainLabel} updated to ${newScore}% after fix.`
          : `${domainLabel} is ${newScore}% — may need another pass.`
      );

      await onRepairComplete?.(result);
      return result;
    },
    [domainId, domainLabel, domainScoreBefore, finding, loadRepairPreview, loc, onRepairComplete, warningsFromFindings]
  );

  const regenerateCard = useCallback(async () => {
    const ticker = loc.companyTicker;
    const pillarId = loc.pillarId;
    const questSlug = loc.questSlug;
    const cardId = loc.cardId;
    if (!ticker || !pillarId || !questSlug || !cardId) {
      setMessage("Missing card location — cannot regenerate.");
      return;
    }

    setPhase("regenerating");
    setMessage(null);

    try {
      const res = await fetch("/api/admin/quest-generation/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          pillarId,
          questSlug,
          cardIds: [cardId],
          force: true,
          fast: true
        })
      });
      const json = (await res.json()) as { error?: string; generated?: number };
      if (!res.ok) {
        throw new Error(json.error ?? "Regeneration failed.");
      }

      setMessage("Card regenerated — verifying score…");
      setPhase("verifying");
      await runVerify("regenerated");
    } catch (err) {
      setPhase("needs_attention");
      setMessage(
        humanizeTechnicalMessage(err instanceof Error ? err.message : "Regenerate failed.")
      );
    }
  }, [loc, runVerify]);

  const verifyOnly = useCallback(async () => {
    setPhase("verifying");
    setMessage(null);
    try {
      await runVerify("verify_only");
    } catch (err) {
      setPhase("needs_attention");
      setMessage(
        humanizeTechnicalMessage(err instanceof Error ? err.message : "Verify failed.")
      );
    }
  }, [runVerify]);

  if (!expanded || !finding) return null;

  const phaseLabel: Record<CardPhase, string> = {
    ready: "Awaiting fix",
    regenerating: "Regenerating card…",
    verifying: "Verifying score…",
    resolved: "Resolved",
    needs_attention: "Needs attention"
  };

  const displayAfter = domainScoreAfter ?? domainScoreBefore;

  return (
    <article
      id={`recovery-card-${cardKey}`}
      className={`scroll-mt-4 rounded-xl border p-4 transition ${
        phase === "resolved"
          ? "border-emerald-500/40 bg-emerald-500/[0.08]"
          : "border-violet-500/35 bg-violet-500/[0.06]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
            Root-cause card
          </p>
          <p className="mt-1 text-[15px] font-semibold text-white/95">
            {loc.companyTicker} → {loc.pillarLabel} →{" "}
            {formatQuestSectionLabel(loc.questSlug, loc.questTitle)} → {loc.cardLabel}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            phase === "resolved"
              ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-200"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200"
          }`}
        >
          {phaseLabel[phase]}
        </span>
      </div>

      {phase !== "resolved" ? (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Flagged sentence
            </p>
            <blockquote className="mt-1 border-l-2 border-amber-400/60 pl-3 text-[14px] italic leading-relaxed text-amber-100/95">
              &ldquo;{finding.flaggedText}&rdquo;
            </blockquote>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Problem
            </p>
            <p className="mt-1 text-[14px] text-white/85">{finding.reason}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300/70">
              Recommended rewrite direction
            </p>
            <p className="mt-1 text-[14px] text-violet-100/90">{finding.rewriteDirection}</p>
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-[12px] text-white/45">
        <span className="font-semibold text-violet-200/90">{domainLabel} impact: </span>
        {domainScoreBefore}%
        {domainScoreAfter != null && domainScoreAfter !== domainScoreBefore ? (
          <span className="font-semibold text-emerald-300"> → {domainScoreAfter}%</span>
        ) : null}
      </p>

      {phase === "resolved" && cardChange ? (
        <RecoveryCardChangeSummary
          change={cardChange}
          domainLabel={domainLabel}
          domainScoreBefore={domainScoreBefore}
          domainScoreAfter={displayAfter}
        />
      ) : phase === "resolved" && finding ? (
        <div className="mt-4 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-[13px] leading-relaxed text-amber-100">
            Score updated. The before/after comparison is still loading — tap below to
            pull the rewritten copy from the database.
          </p>
          <blockquote className="border-l-2 border-amber-400/50 pl-3 text-[13px] italic text-amber-100/90">
            Before: &ldquo;{finding.flaggedText}&rdquo;
          </blockquote>
          <button
            type="button"
            className="min-h-[44px] w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-[14px] font-semibold text-white/85 touch-manipulation"
            onClick={() => void loadRepairPreview("verify_only").then((c) => c && setCardChange(c))}
          >
            Load before / after comparison
          </button>
        </div>
      ) : null}

      {phase !== "resolved" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={phase === "regenerating" || phase === "verifying"}
            className="min-h-[48px] flex-1 rounded-xl border border-[var(--partner-primary)] bg-[var(--partner-primary)] px-4 py-3 text-[15px] font-bold text-black touch-manipulation disabled:opacity-50 active:scale-[0.99]"
            onClick={() => void regenerateCard()}
          >
            {phase === "regenerating" ? "Regenerating…" : "Regenerate card"}
          </button>
          <Link
            href={questRegenerateAdminPath(detail)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[14px] font-semibold text-white/80 touch-manipulation"
          >
            Edit manually
          </Link>
          <button
            type="button"
            disabled={phase === "regenerating" || phase === "verifying"}
            className="min-h-[48px] rounded-xl border border-violet-400/30 bg-violet-500/15 px-4 py-3 text-[14px] font-semibold text-violet-100 touch-manipulation disabled:opacity-50"
            onClick={() => void verifyOnly()}
          >
            {phase === "verifying" ? "Verifying…" : "Verify fix"}
          </button>
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-3 rounded-lg px-3 py-2.5 text-[13px] leading-relaxed ${
            phase === "resolved"
              ? "bg-emerald-500/15 text-emerald-100"
              : "bg-black/30 text-white/75"
          }`}
          role="status"
        >
          {phase === "resolved" ? "✅ " : ""}
          {message}
        </p>
      ) : null}
    </article>
  );
}

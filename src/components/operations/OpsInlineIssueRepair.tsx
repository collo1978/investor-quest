"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { useGame } from "@/components/GameProvider";
import { issueSeverityLabel } from "@/lib/operations/layman";
import { buildOperatorRepairGuide } from "@/lib/operations/operatorRepairGuide";
import { humanizeTechnicalMessage } from "@/lib/operations/layman";
import { readResolutionIntelligence } from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import { formatVerificationDelta } from "@/lib/gameHealth/resolutionIntelligence/verifyIssueDisplay";
import type {
  FixActionClientRepair,
  FixActionId,
  GameHealthIssueRecord
} from "@/lib/gameHealth/types";
import { applyQuestProgressClientRepair } from "@/lib/gameHealth/questProgressClientRepair";
import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";

type RepairPhase =
  | "ready"
  | "fixing"
  | "fixed_pending_verify"
  | "verifying"
  | "resolved"
  | "needs_attention";

function GuideBlock({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        {title}
      </p>
      <div className="mt-1.5 text-[14px] leading-relaxed text-white/88">{children}</div>
    </div>
  );
}

export function OpsInlineIssueRepair({
  issue: initialIssue,
  domainScores,
  onIssueUpdated
}: {
  issue: GameHealthIssueRecord;
  domainScores?: Record<string, number>;
  onIssueUpdated?: () => void | Promise<void>;
}) {
  const [issue, setIssue] = useState(initialIssue);
  const [phase, setPhase] = useState<RepairPhase>(
    initialIssue.status === "resolved" ? "resolved" : "ready"
  );
  const [busy, setBusy] = useState<FixActionId | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const guide = useMemo(() => buildOperatorRepairGuide(issue), [issue]);
  const { actions } = useGame();
  const intelligence = readResolutionIntelligence(issue.metadata);
  const verification = intelligence?.verification;

  const beforeScore =
    verification?.beforeScore ??
    guide.detectionDomainScore ??
    domainScores?.[guide.domainId] ??
    null;

  const afterScore = verification?.afterScore ?? null;

  const reloadIssue = useCallback(async () => {
    const res = await fetch(`/api/admin/game-health/issues/${issue.id}`, {
      cache: "no-store"
    });
    const json = (await res.json()) as { issue?: GameHealthIssueRecord };
    if (json.issue) {
      setIssue(json.issue);
      if (json.issue.status === "resolved") setPhase("resolved");
    }
    await onIssueUpdated?.();
  }, [issue.id, onIssueUpdated]);

  const runAction = useCallback(
    async (action: FixActionId) => {
      setBusy(action);
      setStatusMessage(null);
      if (action === "verify_resolution") setPhase("verifying");
      else setPhase("fixing");

      try {
        const res = await fetch(`/api/admin/game-health/issues/${issue.id}/fix`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action })
        });
        const json = (await res.json()) as {
          ok?: boolean;
          laymanMessage?: string;
          message?: string;
          clientRepair?: FixActionClientRepair;
          verification?: {
            passed: boolean;
            summary: string;
            beforeScore?: number | null;
            afterScore?: number | null;
          };
        };

        let msg =
          json.laymanMessage ??
          (json.message ? humanizeTechnicalMessage(json.message) : null) ??
          (json.ok ? "Done." : "That did not work. Try again.");

        if (json.ok && json.clientRepair?.kind === "quest_progress") {
          const repair = applyQuestProgressClientRepair(
            {
              companyId: json.clientRepair.companyId as CompanyId,
              pillarId: json.clientRepair.pillarId as PillarId,
              questSlug: json.clientRepair.questSlug,
              cardIds: json.clientRepair.cardIds,
              mode: json.clientRepair.mode
            },
            actions.dispatch
          );
          if (repair.laymanMessage) msg = `${msg} ${repair.laymanMessage}`;
        }

        setStatusMessage(msg);

        if (action === "verify_resolution") {
          setPhase(json.ok ? "resolved" : "needs_attention");
        } else if (json.ok) {
          setPhase(action === "mark_resolved" ? "resolved" : "fixed_pending_verify");
        } else {
          setPhase("needs_attention");
        }

        await reloadIssue();
      } catch (err) {
        setStatusMessage(
          humanizeTechnicalMessage(err instanceof Error ? err.message : "Action failed.")
        );
        setPhase("needs_attention");
      } finally {
        setBusy(null);
      }
    },
    [issue.id, reloadIssue, actions.dispatch]
  );

  const copyForDeveloper = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(guide.developerSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [guide.developerSummary]);

  const severityClass =
    issue.severity === "critical" ? "text-red-400" : "text-amber-300";

  const phaseLabel: Record<RepairPhase, string> = {
    ready: "Ready to fix",
    fixing: "Applying fix…",
    fixed_pending_verify: "Fix applied — verify next",
    verifying: "Verifying…",
    resolved: "Resolved",
    needs_attention: "Needs attention"
  };

  const phaseTone: Record<RepairPhase, string> = {
    ready: "border-white/15 bg-white/5 text-white/55",
    fixing: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    fixed_pending_verify: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    verifying: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    needs_attention: "border-amber-500/30 bg-amber-500/10 text-amber-200"
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${severityClass}`}>
          {issueSeverityLabel(issue.severity)}
        </span>
        <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-200/90">
          {guide.domainLabel}
        </span>
        <span className="rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[10px] text-white/45">
          {guide.fixTypeLabel}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${phaseTone[phase]}`}
        >
          {phaseLabel[phase]}
        </span>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-4">
        <GuideBlock title="Problem">{guide.problem}</GuideBlock>
        <GuideBlock title="Root cause">{guide.rootCause}</GuideBlock>
        <GuideBlock title="Why this matters">{guide.whyItMatters}</GuideBlock>
        <GuideBlock title="Player impact">{guide.playerImpact}</GuideBlock>
        {guide.flaggedSentence ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Flagged sentence
            </p>
            <blockquote className="mt-1.5 border-l-2 border-amber-400/50 pl-3 text-[13px] italic text-amber-100/90">
              &ldquo;{guide.flaggedSentence}&rdquo;
            </blockquote>
          </div>
        ) : null}
        <GuideBlock title="Exact fix">{guide.exactFix}</GuideBlock>
        <GuideBlock title="Score impact">
          <span className="font-semibold text-violet-200/95">{guide.scoreImpactLabel}</span>
          {beforeScore != null ? (
            <span className="mt-1 block text-[13px] text-white/50">
              Current {guide.domainLabel}: {beforeScore}%
              {afterScore != null ? ` → ${afterScore}% after verify` : ""}
            </span>
          ) : null}
        </GuideBlock>
        <GuideBlock title="Expected outcome">{guide.expectedOutcome}</GuideBlock>
      </div>

      {verification ? (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
            Verify result
          </p>
          <p className="mt-1 text-[14px] text-white/85">{verification.summary}</p>
          {beforeScore != null && afterScore != null ? (
            <p className="mt-2 font-[var(--font-grotesk)] text-lg font-bold text-emerald-300">
              {guide.domainLabel}: {beforeScore}% → {afterScore}%
              {formatVerificationDelta(verification)
                ? ` (${formatVerificationDelta(verification)})`
                : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          What to do next
        </p>
        <p className="text-[15px] font-semibold leading-snug text-violet-100/95">
          {guide.nextStep}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {guide.openContentHref && guide.fixType === "regenerate_content" ? (
          <Link
            href={guide.openContentHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] rounded-xl border border-sky-400/30 bg-sky-500/12 px-4 py-2.5 text-[13px] font-semibold text-sky-100 touch-manipulation"
          >
            Open flagged content
          </Link>
        ) : null}
        {guide.regenerateHref && guide.fixType === "regenerate_content" ? (
          <Link
            href={guide.regenerateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white/75 touch-manipulation"
          >
            Prompt Studio
          </Link>
        ) : null}
      </div>

      <div className="space-y-2">
        {guide.fixType === "developer_required" ? (
          <OpsTouchButton variant="primary" onClick={() => void copyForDeveloper()}>
            {copied ? "Copied for developer" : "Copy issue for developer"}
          </OpsTouchButton>
        ) : guide.primaryActionId ? (
          <OpsTouchButton
            variant="primary"
            disabled={Boolean(busy) || phase === "resolved"}
            onClick={() => void runAction(guide.primaryActionId!)}
            description={guide.scoreImpactLabel}
          >
            {busy === guide.primaryActionId ? "Working…" : "Fix this issue"}
          </OpsTouchButton>
        ) : null}

        <OpsTouchButton
          variant="secondary"
          disabled={Boolean(busy) || phase === "resolved"}
          onClick={() => void runAction("verify_resolution")}
          description={`Confirms ${guide.domainLabel} improved`}
        >
          {busy === "verify_resolution" ? "Verifying…" : "Verify fix"}
        </OpsTouchButton>

        {phase !== "resolved" ? (
          <OpsTouchButton
            variant="ghost"
            disabled={Boolean(busy)}
            onClick={() => void runAction("mark_resolved")}
          >
            Mark as handled
          </OpsTouchButton>
        ) : null}
      </div>

      {statusMessage ? (
        <p
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[14px] leading-relaxed text-white/85"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      <p className="text-[11px] text-white/35 lg:hidden">
        On your phone?{" "}
        <Link
          href={`/admin/mobile-fix/${issue.id}`}
          className="font-semibold text-violet-300 underline"
        >
          Open mobile repair view
        </Link>
      </p>
    </div>
  );
}

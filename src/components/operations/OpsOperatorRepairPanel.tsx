"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { OpsIssueActionableDetail } from "@/components/operations/OpsIssueActionableDetail";
import { OpsTouchButton } from "@/components/operations/OpsTouchButton";
import { issueSeverityLabel } from "@/lib/operations/layman";
import {
  buildOperatorRepairGuide,
  type OperatorFixType,
  type OperatorRepairGuide,
  type OperatorUrgency
} from "@/lib/operations/operatorRepairGuide";
import { operatorFixActionsForIssue } from "@/lib/operations/fixActions";
import type { FixActionId, GameHealthIssueRecord } from "@/lib/gameHealth/types";

function urgencyTone(urgency: OperatorUrgency): string {
  switch (urgency) {
    case "critical":
      return "border-red-500/40 bg-red-500/15 text-red-200";
    case "soon":
      return "border-amber-500/35 bg-amber-500/12 text-amber-200";
    default:
      return "border-white/15 bg-white/5 text-white/55";
  }
}

function fixTypeTone(fixType: OperatorFixType): string {
  switch (fixType) {
    case "developer_required":
      return "border-sky-500/35 bg-sky-500/12 text-sky-200";
    case "regenerate_content":
      return "border-violet-500/35 bg-violet-500/15 text-violet-200";
    case "one_tap_admin":
      return "border-emerald-500/35 bg-emerald-500/12 text-emerald-200";
    default:
      return "border-white/15 bg-white/5 text-white/50";
  }
}

function GuideSection({
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
      <div className="mt-1.5 text-[15px] leading-relaxed text-white/88">{children}</div>
    </div>
  );
}

export function OpsOperatorRepairPanel({
  issue,
  guide: guideProp,
  busy,
  onRunFix,
  showActionableDetail = true,
  compact
}: {
  issue: GameHealthIssueRecord;
  guide?: OperatorRepairGuide;
  busy?: FixActionId | null;
  onRunFix?: (action: FixActionId) => void;
  showActionableDetail?: boolean;
  compact?: boolean;
}) {
  const guide = useMemo(
    () => guideProp ?? buildOperatorRepairGuide(issue),
    [guideProp, issue]
  );
  const actions = useMemo(() => operatorFixActionsForIssue(issue), [issue]);
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);

  const primary = actions[0];
  const secondary = actions.slice(1);

  const copyForDeveloper = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(guide.developerSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [guide.developerSummary]);

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${urgencyTone(guide.urgency)}`}
        >
          {guide.urgencyLabel}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${fixTypeTone(guide.fixType)}`}
        >
          {guide.fixTypeLabel}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
          {issueSeverityLabel(issue.severity)}
        </span>
      </div>

      <p className="font-[var(--font-grotesk)] text-[20px] font-bold leading-snug text-white">
        {guide.headline}
      </p>

      <div className="space-y-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <GuideSection title="1 · What is happening?">{guide.problem}</GuideSection>
        <GuideSection title="2 · What players may experience">
          {guide.playerImpact}
        </GuideSection>
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
            3 · What you should do next
          </p>
          <p className="mt-2 text-[16px] font-semibold leading-snug text-violet-50">
            {guide.nextStep}
          </p>
          {!guide.canOperatorFixAlone ? (
            <p className="mt-2 text-[13px] text-white/50">
              You cannot fully fix this in the game UI alone.
            </p>
          ) : null}
        </div>
        <GuideSection title="4 · Fix type">{guide.fixTypeLabel}</GuideSection>
        <GuideSection title="5 · Expected outcome">{guide.expectedOutcome}</GuideSection>
      </div>

      {showActionableDetail ? <OpsIssueActionableDetail issue={issue} /> : null}

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          6 · Your action
        </p>

        {guide.fixType === "developer_required" ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-[14px] leading-relaxed text-sky-100/90">
              This is not an in-game fix. Send the summary below to your developer (Cursor,
              Vercel, or Supabase setup).
            </div>
            <OpsTouchButton variant="primary" onClick={() => void copyForDeveloper()}>
              {copied ? "Copied for developer" : "Copy issue for developer"}
            </OpsTouchButton>
          </div>
        ) : null}

        {guide.openContentHref && guide.fixType === "regenerate_content" ? (
          <Link
            href={guide.openContentHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-sky-400/35 bg-sky-500/15 px-4 text-[15px] font-semibold text-sky-100 touch-manipulation active:scale-[0.99]"
          >
            Open flagged content
          </Link>
        ) : null}

        {guide.regenerateHref && guide.fixType === "regenerate_content" ? (
          <Link
            href={guide.regenerateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-violet-400/35 bg-violet-500/20 px-4 text-[15px] font-semibold text-violet-100 touch-manipulation active:scale-[0.99]"
          >
            Open Prompt Studio to regenerate
          </Link>
        ) : null}

        {onRunFix && primary ? (
          <OpsTouchButton
            variant="primary"
            disabled={Boolean(busy)}
            onClick={() => onRunFix(primary.action)}
            description={primary.description}
          >
            {busy === primary.action ? "Working…" : primary.label}
          </OpsTouchButton>
        ) : null}

        {onRunFix && secondary.length > 0 ? (
          <div className="mt-3">
            <button
              type="button"
              className="text-[12px] font-semibold text-white/50 touch-manipulation"
              onClick={() => setShowMore((v) => !v)}
            >
              {showMore ? "Hide" : "Show"} more actions
            </button>
            {showMore ? (
              <div className="mt-2 space-y-2">
                {secondary.map((btn) => (
                  <OpsTouchButton
                    key={btn.action}
                    variant={btn.variant === "danger" ? "danger" : "secondary"}
                    disabled={Boolean(busy)}
                    onClick={() => onRunFix(btn.action)}
                    description={btn.description}
                  >
                    {busy === btn.action ? "Working…" : btn.label}
                  </OpsTouchButton>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

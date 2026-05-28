"use client";

import { useState, type ReactNode } from "react";

import { tierFromScoreOrLabel } from "@/lib/operations/healthTier";
import type {
  BehavioralAuditScores,
  BehavioralDesignAuditReport,
  FoggFactorId,
  HookStageId,
  OctalysisDriveId,
  SdtNeedId
} from "@/platform/gamification/behavioralDesign/types";

import {
  AuditStatusBadge,
  BulletList,
  ScoreBar,
  SourceTypeBadge
} from "@/components/platform/behavioralDesign/auditUi";
import { opsPanel } from "@/components/operations/opsTheme";

function FrameworkShell({
  title,
  purpose,
  healthPercent,
  status,
  sourceType,
  children,
  defaultOpen = false
}: {
  title: string;
  purpose: string;
  healthPercent: number;
  status: BehavioralDesignAuditReport["overallStatus"];
  sourceType: BehavioralDesignAuditReport["sourceType"];
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tier = tierFromScoreOrLabel(healthPercent, null);

  return (
    <div className="rounded-xl border border-white/8 bg-black/20">
      <button
        type="button"
        className="flex w-full min-h-[44px] items-center justify-between gap-3 px-3 py-2.5 text-left touch-manipulation"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-white/90">{title}</p>
          <p className="mt-0.5 text-[11px] text-white/45">{purpose}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AuditStatusBadge status={status} />
            <SourceTypeBadge type={sourceType} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="font-[var(--font-grotesk)] text-xl font-bold tabular-nums"
            style={{ color: tier.color }}
          >
            {healthPercent}%
          </span>
          <span className="text-white/35">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open ? <div className="space-y-4 border-t border-white/8 px-3 py-3">{children}</div> : null}
    </div>
  );
}

export function OctalysisFrameworkPanel({
  report,
  scores,
  onScoreChange
}: {
  report: BehavioralDesignAuditReport["octalysis"];
  scores: BehavioralAuditScores["octalysis"];
  onScoreChange: (driveId: OctalysisDriveId, value: number) => void;
}) {
  return (
    <FrameworkShell
      title={report.label}
      purpose={report.purpose}
      healthPercent={report.healthPercent}
      status={report.status}
      sourceType={report.sourceType}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${opsPanel} !p-3`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
            Balance
          </p>
          <ul className="mt-2 space-y-1 text-[12px] text-white/65">
            <li>Intrinsic {report.balance.intrinsicPercent}% · Extrinsic {report.balance.extrinsicPercent}%</li>
            <li>White Hat {report.balance.whiteHatPercent}% · Black Hat {report.balance.blackHatPercent}%</li>
            <li>Left brain {report.balance.leftBrainPercent}% · Right brain {report.balance.rightBrainPercent}%</li>
          </ul>
          {report.overused.length > 0 ? (
            <p className="mt-2 text-[11px] text-amber-200/80">
              Possibly overused: {report.overused.join(", ")}
            </p>
          ) : null}
          {report.underused.length > 0 ? (
            <p className="mt-1 text-[11px] text-violet-200/80">
              Underused: {report.underused.join(", ")}
            </p>
          ) : null}
        </div>
        <BulletList title="Already in Investor Quest" items={report.presentSummary} tone="positive" />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
          Core drives (editable scores)
        </p>
        {report.drives.map((d) => (
          <div
            key={d.id}
            className="rounded-lg border border-white/8 bg-black/25 px-3 py-2.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-semibold text-white/85">{d.label}</p>
                <p className="text-[11px] text-white/45">{d.purpose}</p>
              </div>
              <AuditStatusBadge status={d.status} />
            </div>
            <div className="mt-3">
              <ScoreBar
                label="Drive strength"
                score={scores[d.id]}
                onChange={(v) => onScoreChange(d.id, v)}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <BulletList title="Present" items={d.presentInProduct} tone="positive" />
              <BulletList title="Missing opportunities" items={d.missingOpportunities} tone="warn" />
            </div>
          </div>
        ))}
      </div>

      {report.warnings.length > 0 ? (
        <BulletList
          title="Warnings"
          items={report.warnings.map((w) => w.message)}
          tone="warn"
        />
      ) : null}
      <BulletList title="Suggested improvements" items={report.suggestions} />
    </FrameworkShell>
  );
}

export function HookFrameworkPanel({
  report,
  scores,
  onScoreChange
}: {
  report: BehavioralDesignAuditReport["hook"];
  scores: BehavioralAuditScores["hook"];
  onScoreChange: (stageId: HookStageId, value: number) => void;
}) {
  return (
    <FrameworkShell
      title={report.label}
      purpose={report.purpose}
      healthPercent={report.healthPercent}
      status={report.status}
      sourceType={report.sourceType}
    >
      <p className="text-[12px] text-white/55">
        Overall habit loop health reflects Trigger → Action → Variable Reward → Investment.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {report.stages.map((s) => (
          <div key={s.id} className="rounded-lg border border-white/8 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-white/85">{s.label}</p>
              <AuditStatusBadge status={s.status} />
            </div>
            <div className="mt-2">
              <ScoreBar
                label={`${s.label} health`}
                score={scores[s.id]}
                onChange={(v) => onScoreChange(s.id, v)}
              />
            </div>
            <div className="mt-3 space-y-2">
              <BulletList title="Present" items={s.presentInProduct} tone="positive" />
              <BulletList title="Missing" items={s.missingOpportunities} tone="warn" />
            </div>
          </div>
        ))}
      </div>
      {report.warnings.length > 0 ? (
        <BulletList title="Warnings" items={report.warnings.map((w) => w.message)} tone="warn" />
      ) : null}
      <BulletList title="Suggested improvements" items={report.suggestions} />
    </FrameworkShell>
  );
}

export function SdtFrameworkPanel({
  report,
  scores,
  onScoreChange
}: {
  report: BehavioralDesignAuditReport["sdt"];
  scores: BehavioralAuditScores["sdt"];
  onScoreChange: (needId: SdtNeedId, value: number) => void;
}) {
  return (
    <FrameworkShell
      title={report.label}
      purpose={report.purpose}
      healthPercent={report.healthPercent}
      status={report.status}
      sourceType={report.sourceType}
    >
      <p className="text-[12px] text-white/55">
        Healthy motivation requires Autonomy, Competence, and Relatedness in balance.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {report.needs.map((n) => (
          <div key={n.id} className="rounded-lg border border-white/8 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-white/85">{n.label}</p>
              <AuditStatusBadge status={n.status} />
            </div>
            <div className="mt-2">
              <ScoreBar
                label={`${n.label} health`}
                score={scores[n.id]}
                onChange={(v) => onScoreChange(n.id, v)}
              />
            </div>
            <div className="mt-3 space-y-2">
              <BulletList title="Present" items={n.presentInProduct} tone="positive" />
              <BulletList title="Missing" items={n.missingOpportunities} tone="warn" />
            </div>
          </div>
        ))}
      </div>
      {report.warnings.length > 0 ? (
        <BulletList title="Warnings" items={report.warnings.map((w) => w.message)} tone="warn" />
      ) : null}
      <BulletList title="Suggested improvements" items={report.suggestions} />
    </FrameworkShell>
  );
}

export function FoggFrameworkPanel({
  report,
  scores,
  onScoreChange
}: {
  report: BehavioralDesignAuditReport["fogg"];
  scores: BehavioralAuditScores["fogg"];
  onScoreChange: (factorId: FoggFactorId, value: number) => void;
}) {
  return (
    <FrameworkShell
      title={report.label}
      purpose={report.purpose}
      healthPercent={report.healthPercent}
      status={report.status}
      sourceType={report.sourceType}
    >
      <p className="text-[12px] text-white/55">
        Behavior = Motivation × Ability × Prompt. Weakest factor caps real-world completion.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {report.factors.map((f) => (
          <div key={f.id} className="rounded-lg border border-white/8 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-white/85">{f.label}</p>
              <AuditStatusBadge status={f.status} />
            </div>
            <div className="mt-2">
              <ScoreBar
                label={`${f.label} health`}
                score={scores[f.id]}
                onChange={(v) => onScoreChange(f.id, v)}
              />
            </div>
            <div className="mt-3 space-y-2">
              <BulletList title="Present" items={f.presentInProduct} tone="positive" />
              <BulletList title="Missing" items={f.missingOpportunities} tone="warn" />
            </div>
          </div>
        ))}
      </div>
      {report.warnings.length > 0 ? (
        <BulletList title="Warnings" items={report.warnings.map((w) => w.message)} tone="warn" />
      ) : null}
      <BulletList title="Suggested improvements" items={report.suggestions} />
    </FrameworkShell>
  );
}
